import * as ko from "knockout";
import { HTMLorSVGElement, VelocityResult } from "velocity-animate";
import { ActionName } from "./ActionName";
import ActionObservable from "./ActionObservable";
import { AnimationWrapper } from "./Animation";
import AnimationHelpers from "./AnimationHelpers";
import Animations from "./Animations";
import { DebuffType } from "./DebuffType";
import Friendly from "./Friendly";
import { FriendlyParams } from "./FriendlyParams";
import Heal from "./Heal";

export default class Player extends Friendly {
  private _adjustMana = (amount: number) => {
    const currentMana = this.mana();
    const newMana = currentMana + amount;

    if (newMana >= this.maxMana()) {
      this.mana(this.maxMana());
    } else if (newMana <= 0) {
      this.mana(0);
    } else {
      this.mana(newMana);
    }
  };

  private _cast = (heal: Heal) => {
    if (this._isSilenced()) {
      return;
    }

    if (heal.isInstant) {
      this.spendMana(heal.manaCost);
    }

    this.currentCast.action("finish");
    this.currentCast.value(heal);
  };

  private _isSilenced() {
    return this.getDebuffsByType(DebuffType.Silence).length > 0;
  }

  private _regenMana = () => {
    const increase = Math.round(this.maxMana() * 0.05);
    this._adjustMana(increase);
    this.regenManaNotifier(true);
  };

  private _queuedAction: Heal | null = null;

  protected override _onDeath = () => {
    this.stop();
    this.buffs.removeAll();
    this.debuffs.removeAll();
    this.isDead(true);
    this.target(undefined);
  };

  actions: ko.ObservableArray<ActionName>;
  cancelCast = () => {
    this._queuedAction = null;
    this.currentCast.action("stop");
    this.currentCast.value(null);
  };

  cast = (heal: Heal) => {
    if (this._isSilenced()) {
      return;
    }

    const currentCast = this.currentCast.value();
    if (currentCast) {
      if (!currentCast.isInstant && currentCast.castProgress > 0.5) {
        // If an action is cast while already casting, queue up the action.
        // It will cast immediately after the current cast completes.
        this._queuedAction = heal;
      }

      return;
    }

    this._cast(heal);
  };

  castQueuedHeal = () => {
    if (this._queuedAction) {
      this._cast(this._queuedAction);
      this._queuedAction = null;
    } else {
      this.currentCast.value(null);
    }
  };

  critChance = ko.pureComputed(() => 0.1);
  currentCast: ActionObservable<Heal> = new ActionObservable<Heal>();
  getActionByIndex = (index: number) => {
    return index >= 0 && this.actions().length > index
      ? this.actions()[index]
      : null;
  };

  hasFullMana: ko.PureComputed<boolean> = ko.pureComputed(
    () => this.mana() >= this.maxMana()
  );
  mana: ko.Observable<number>;
  manaPercentageString = ko.pureComputed(
    () => `${(100.0 * this.mana()) / this.maxMana()}%`
  );
  manaStatusString = ko.pureComputed(
    () => `${this.mana()} / ${this.maxMana()}`
  );
  maxMana: ko.Observable<number>;
  regenManaNotifier: ko.Observable<boolean> = ko
    .observable(true)
    .extend({ notify: "always" });

  get regenManaAnimation(): AnimationWrapper {
    const wrapper = { ...Animations.fullWidth5000 };
    wrapper.animation.options.begin = () => this.regenManaNotifier(true);
    wrapper.animation.options.complete = (
      elements: VelocityResult<HTMLorSVGElement> | undefined
    ) => {
      AnimationHelpers.removeStyleAttribute(elements);
      this._regenMana();
    };
    return wrapper;
  }
  restoreManaToMax = () => {
    this.mana(this.maxMana());
  };

  setTarget = (target: Friendly | undefined) => {
    if (!this.isDead()) {
      this.target(target);
    }
  };

  spendMana = (amount: number) => {
    this._adjustMana(0 - amount);
  };

  target: ko.Observable<Friendly | undefined>;

  constructor(params: FriendlyParams, mana: number, actions: ActionName[]) {
    super("Player", params);

    this.mana = ko.observable(mana);
    this.maxMana = ko.observable(mana);
    this.actions = ko.observableArray<ActionName>(actions);
    this.target = ko.observable();
  }
}
