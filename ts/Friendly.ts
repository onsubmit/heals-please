import * as ko from "knockout";
import AnimationHelpers from "./AnimationHelpers";
import Buff from "./Buff";
import Debuff from "./Debuff";
import { DebuffType } from "./DebuffType";
import { FriendlyParams } from "./FriendlyParams";
import HealOutcome from "./HealOutcome";
import Loop from "./Loop";
import Loops from "./Loops";

export default class Friendly {
  private _adjustHealth = (amount: number): number => {
    const currentHealth = this.health();
    const newHealth = currentHealth + amount;

    if (newHealth >= this._maxHealth) {
      this.health(this._maxHealth);
      return newHealth - this._maxHealth; // overheal
    }

    if (newHealth <= 0) {
      this.health(0);
      return newHealth; // underheal
    }

    this.health(newHealth);
    return 0;
  };

  private _attackInterval: number;
  private _getDebuffsByType = (debuffType: DebuffType): Debuff[] => {
    return this.debuffs().filter(
      (debuff: Debuff) => debuff.type === debuffType
    );
  };

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

  private _maxHealth: number;
  private _onAttackCallback: () => void;
  private _onDeathCallback: (friendly: Friendly) => any;

  protected _loops: Loops;
  protected _onDeath = () => {
    this.stop();
    this.buffs.removeAll();
    this.debuffs.removeAll();
    this.isDead(true);
  };

  animations: any = {
    // TODO: Create type for animations
    fastFadeOut: {
      animation: {
        properties: AnimationHelpers.fadeOut,
        options: {
          duration: 1000,
          begin: AnimationHelpers.removeStyleAttribute,
        },
      },
    },
  };
  applyBuff = (buff: Buff) => {
    // Remove any pre-existing buffs by this name.
    this.removeBuff(buff.name);

    buff.start(this);
    this.buffs.push(buff);
  };

  applyDebuff = (debuff: Debuff) => {
    debuff.start(this);
    this.debuffs.push(debuff);
  };

  buffs: ko.ObservableArray<Buff>;
  debuffs: ko.ObservableArray<Debuff>;
  harm = (amount: number) => {
    const debuffs = this._getDebuffsByType(DebuffType.IncreaseDamageTaken);
    debuffs.forEach((debuff: Debuff) => {
      amount = debuff.effect(this, amount);
    });

    return this._adjustHealth(0 - amount);
  };

  heal = (amount: number, isCrit: boolean): HealOutcome => {
    const healOutcome = new HealOutcome();
    healOutcome.amount = amount;
    healOutcome.isCrit = isCrit;

    if (this.isDead()) {
      healOutcome.targetDied = true;
    } else {
      const overheal = this._adjustHealth(amount);
      healOutcome.overheal = overheal;
    }

    this.lastHealInfo(healOutcome);

    return healOutcome;
  };

  healToMax = (allowResurrection: boolean) => {
    if (this.isDead() && allowResurrection) {
      this.resurrect(this._maxHealth);
    } else {
      this.health(this._maxHealth);
    }
  };

  health: ko.Observable<number>;
  healthPercentage: ko.PureComputed<number> = ko.pureComputed(
    () => this.health() / this._maxHealth
  );
  healthPercentageString: ko.PureComputed<string> = ko.pureComputed(
    () => `${100.0 * this.healthPercentage()}%`
  );
  healthStatusString: ko.PureComputed<string> = ko.pureComputed(
    () => `${this.health()}/${this._maxHealth}`
  );
  isDead: ko.Observable<boolean>;
  isPlayer: boolean;
  lastHealInfo: ko.Observable<HealOutcome | undefined>;
  lastHealStatusString: ko.PureComputed<string> = ko.pureComputed(() => {
    const lastHealInfo = this.lastHealInfo();

    if (!lastHealInfo || lastHealInfo.targetDied) {
      return "";
    }

    return `+${lastHealInfo.effectiveAmount}`;
  });
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

  removeBuff = (buffNameToRemove: string) => {
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

  removeDebuff = (debuffNameToRemove: string): boolean => {
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
    this.buffs.removeAll();
    this.debuffs.removeAll();
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
      this.health(health || Math.round(this._maxHealth * 0.2));
    }
  };

  start = () => {
    this._loops.start();
  };

  stop = () => {
    this._loops.stop();
    this.buffs().forEach(function (buff: Buff) {
      buff.stop();
    });

    this.debuffs().forEach(function (debuff: Debuff) {
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

    this.isPlayer = false;

    this._maxHealth = params.maxHealth || health;
    this._initialAttackDelay = params.initialAttackDelay || 0;
    this._attackInterval = params.attackInterval || 1000;
    this._onAttackCallback = params.onAttack;
    this._onDeathCallback = params.onDeath;

    this._loops = new Loops(
      new Loop(
        "Attack",
        this._onAttackCallback,
        this._attackInterval,
        this._initialAttackDelay
      )
    );

    this._initialize();
  }
}
