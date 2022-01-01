import * as ko from "knockout";
import { ActionName } from "./ActionName";
import Friendly from "./Friendly";
import { FriendlyParams } from "./FriendlyParams";
import Loop from "./Loop";
import Loops from "./Loops";

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

  private _regenMana = () => {
    const increase = this.maxMana() * 0.05;
    this._adjustMana(increase);
  };

  protected override _onDeath = () => {
    this.stop();
    this.buffs.removeAll();
    this.debuffs.removeAll();
    this.isDead(true);
    this.target(undefined);
  };

  actions: ko.ObservableArray<ActionName>;
  critChance = ko.pureComputed(() => 0.1);
  getActionByIndex = (index: number) => {
    return index >= 0 && this.actions().length > index
      ? this.actions()[index]
      : null;
  };

  inGlobalCooldown: ko.Observable<boolean>;
  mana: ko.Observable<number>;
  manaPercentageString = ko.pureComputed(
    () => `${(100.0 * this.mana()) / this.maxMana()}%`
  );
  manaStatusString = ko.pureComputed(
    () => `${this.mana()} / ${this.maxMana()}`
  );
  maxMana: ko.Observable<number>;
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
    this.inGlobalCooldown = ko.observable(false);

    this.isPlayer = true;

    this._loops = new Loops(new Loop("Regen Mana", this._regenMana, 5000));
    this._loops.start();
  }
}