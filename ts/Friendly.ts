import * as ko from "knockout";
import { ActionName } from "./ActionName";
import Animations from "./Animations";
import Buff from "./Buff";
import { BuffName } from "./BuffName";
import Debuff from "./Debuff";
import { DebuffName } from "./DebuffName";
import { DebuffType } from "./DebuffType";
import { FriendlyParams } from "./FriendlyParams";
import HealOutcome from "./HealOutcome";
import Loop from "./Loop";
import Loops from "./Loops";
import Stats from "./Stats";

export default class Friendly {
  private _adjustHealth = (amount: number): number => {
    const currentHealth = this.health();
    const newHealth = currentHealth + amount;

    if (newHealth >= this.maxHealth()) {
      this.health(this.maxHealth());
      return newHealth - this.maxHealth(); // overheal
    }

    if (newHealth <= 0) {
      this.health(0);
      return newHealth; // underheal
    }

    this.health(newHealth);
    return 0;
  };

  private _attack = () => {
    this._onAttackCallback(this);
  };

  private _attackInterval: number;
  private _initialAttackDelay: number;
  private _initialize = () => {
    const healthSubscription = this.health.subscribe(
      (currentHealth: number) => {
        if (currentHealth === 0) {
          this._onDeath();
          if (this._onDeathCallback) {
            this._onDeathCallback(this);
          }

          healthSubscription.dispose();
        }
      }
    );
  };

  private _onAttackCallback: (friendly: Friendly) => void;
  private _onDeathCallback: (friendly: Friendly) => any;
  private _stats = Stats;

  protected getDebuffsByType = (debuffType: DebuffType): Debuff[] => {
    return this.debuffs().filter(
      (debuff: Debuff) => debuff.type === debuffType
    );
  };

  protected _loops: Loops;
  protected _onDeath = () => {
    this.stop();
    this.buffs.removeAll();
    this.debuffs.removeAll();
    this.isDead(true);
  };

  animations: typeof Animations = Animations;
  applyBuff = (buff: Buff) => {
    // Remove any pre-existing buffs by this name.
    this.removeBuff(buff.name);

    buff.start(this);
    this.buffs.push(buff);
  };

  applyDebuff = (debuff: Debuff) => {
    const currentDebuffs = this.getDebuffsByType(debuff.type);
    if (currentDebuffs.length) {
      // Don't apply the buff twice, just restart the current one.
      currentDebuffs.forEach((currentDebuff) => currentDebuff.restart());
    } else {
      debuff.start(this);
      this.debuffs.push(debuff);
    }
  };

  buffs: ko.ObservableArray<Buff>;
  debuffs: ko.ObservableArray<Debuff>;
  harm = (amount: number) => {
    const debuffs = this.getDebuffsByType(DebuffType.IncreaseDamageTaken);
    debuffs.forEach((debuff: Debuff) => {
      if (debuff.harmEffect) {
        amount = debuff.harmEffect(this, amount);
      }
    });

    return this._adjustHealth(0 - amount);
  };

  heal = (
    healName: ActionName,
    amount: number,
    isCrit: boolean,
    isFromHotBuff: boolean = false,
    isFirstHotTick: boolean = false
  ): HealOutcome => {
    const healOutcome = new HealOutcome(healName);
    healOutcome.amount = amount;
    healOutcome.isCrit = isCrit;
    healOutcome.isFromHotBuff = isFromHotBuff;
    healOutcome.isFirstHotTick = isFirstHotTick;

    if (this.isDead()) {
      healOutcome.targetDied = true;
    } else {
      const overheal = this._adjustHealth(amount);
      this.debuffs().forEach((debuff) => debuff.postHealCallback(this));

      healOutcome.overheal = overheal;
    }

    this.lastHealInfo(healOutcome);

    this._stats.update(healOutcome);
    return healOutcome;
  };

  healToMax = (allowResurrection: boolean) => {
    if (this.isDead() && allowResurrection) {
      this.resurrect(this.maxHealth());
    } else {
      this.health(this.maxHealth());
    }
  };

  health: ko.Observable<number>;
  healthPercentage: ko.PureComputed<number> = ko.pureComputed(
    () => this.health() / this.maxHealth()
  );
  healthPercentageString: ko.PureComputed<string> = ko.pureComputed(
    () => `${100.0 * this.healthPercentage()}%`
  );
  healthStatusString: ko.PureComputed<string> = ko.pureComputed(
    () => `${this.health()}/${this.maxHealth()}`
  );
  isDead: ko.Observable<boolean>;
  lastHealInfo: ko.Observable<HealOutcome | undefined>;
  lastHealStatusString: ko.PureComputed<string> = ko.pureComputed(() => {
    const lastHealInfo = this.lastHealInfo();

    if (!lastHealInfo || lastHealInfo.targetDied) {
      return "";
    }

    return `+${lastHealInfo.effectiveAmount}`;
  });
  maxHealth: ko.Observable<number>;
  name: string;
  pause = () => {
    this._loops.pause();
    this.buffs().forEach(function (buff: Buff) {
      buff.pause();
    });

    this.debuffs().forEach(function (debuff: Debuff) {
      debuff.pause();
    });
  };

  removeBuff = (buffNameToRemove: BuffName) => {
    const removedBuffs = this.buffs.remove(
      (buff: Buff) => buff.name === buffNameToRemove
    );

    if (removedBuffs.length) {
      removedBuffs.forEach((removedBuff: Buff) => {
        removedBuff.stop();
      });

      return true;
    }

    return false;
  };

  removeDebuff = (debuffNameToRemove: DebuffName): boolean => {
    const removedDebuffs = this.debuffs.remove(
      (debuff: Debuff) => debuff.name === debuffNameToRemove
    );

    if (removedDebuffs.length) {
      removedDebuffs.forEach((removedDebuff: Debuff) => {
        removedDebuff.stop();
      });

      return true;
    }

    return false;
  };

  removeLastDebuff = () => {
    this.debuffs.pop().stop();
  };

  reset = () => {
    this.healToMax(true);
    this.buffs.removeAll().forEach((buff) => buff.stop());
    this.debuffs.removeAll().forEach((debuff) => debuff.stop());
  };

  resume = () => {
    this._loops.resume();
    this.buffs().forEach(function (buff: Buff) {
      buff.resume();
    });

    this.debuffs().forEach(function (debuff: Debuff) {
      debuff.resume();
    });
  };

  resurrect = (health: number) => {
    if (this.isDead()) {
      this.isDead(false);
      this.health(health || Math.round(this.maxHealth() * 0.2));
    }
  };

  start = () => {
    this._loops.start();
  };

  stop = () => {
    this._loops.stop();

    this.buffs.removeAll().forEach(function (buff: Buff) {
      buff.stop();
    });

    this.debuffs.removeAll().forEach(function (debuff: Debuff) {
      debuff.stop();
    });
  };

  constructor(name: string, params: FriendlyParams) {
    const health = params.health || 100;

    this.name = name;
    this.health = ko.observable(health);
    this.isDead = ko.observable(false);
    this.buffs = ko.observableArray<Buff>([]);
    this.debuffs = ko.observableArray<Debuff>([]);
    this.lastHealInfo = ko.observable<HealOutcome | undefined>();

    this.maxHealth = ko.observable(params.maxHealth || health);
    this._initialAttackDelay = params.initialAttackDelay || 0;
    this._attackInterval = params.attackInterval || 1000;
    this._onAttackCallback = params.onAttack;
    this._onDeathCallback = params.onDeath;

    this._loops = new Loops(
      new Loop(
        "Attack",
        this._attack,
        this._attackInterval,
        this._initialAttackDelay
      )
    );

    this._initialize();
  }

  get isAtFullHealth(): boolean {
    return this.health() === this.maxHealth();
  }
}
