import * as ko from "knockout";
import "../css/app.less";
import GamePageHtml from "../html/GamePage.html";
import { ActionName } from "./ActionName";
import AnimationHelpers from "./AnimationHelpers";
import Animations from "./Animations";
import Boss from "./Boss";
import { BossName } from "./Bosses/BossName";
import BossFactory from "./BossFactory";
import Buff from "./Buff";
import Debuff from "./Debuff";
import Friendly from "./Friendly";
import Heal from "./Heal";
import HealFactory from "./HealFactory";
import HealOutcome from "./HealOutcome";
import Party from "./Party";
import Player from "./Player";
import Random from "./Random";
import Rewards from "./Rewards";
import Stats from "./Stats";

class GameViewModel {
  private _document_onKeyPress = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    const keyCode = keyboardEvent.keyCode;

    if (keyCode === 27) {
      // ESC
      this.cancelCast();
    }
    if (keyCode === 32) {
      // SPACE
      const previousCast = this.player.currentCast.previous();
      if (previousCast && previousCast.name) {
        this.cast(previousCast.name);
      }
    } else if (keyCode >= 48 && keyCode <= 57) {
      // 0-9
      const actionIndex = keyCode - 49; // - '0' - 1
      const action = this.player.getActionByIndex(actionIndex);
      if (action) {
        this.cast(action);
      }
    } else {
      let partyIndex = -1;
      switch (keyCode) {
        case 81: // q
          partyIndex = 0;
          break;
        case 87: // w
          partyIndex = 1;
          break;
        case 69: // e
          partyIndex = 2;
          break;
        case 82: // r
          partyIndex = 3;
          break;
        case 84: // t
          partyIndex = 4;
          break;
        default:
          return;
      }

      const member = this.friendlies.getMemberByIndex(partyIndex);
      this.player.setTarget(member);
    }
  };

  private _finishCast = (action: Heal, outcome: HealOutcome) => {
    if (!outcome.manaSpent && !outcome.targetDied) {
      this.player.spendMana(action.manaCost);
    }

    if (!outcome.targetDied) {
      const heals = `${outcome.isCrit ? "crits" : "heals"}`;
      let message = `${action.name} ${heals} ${action.target.name} for ${outcome.effectiveAmount}`;

      if (outcome.overheal) {
        message += ` (${outcome.overheal} overheal)`;
      }

      message += ".";

      this.addLog(message);
    }

    this.player.castQueuedHeal();
  };

  private _onBossKill = () => {
    const bossName = this.boss().name;

    this.addLog(`${bossName} was defeated!`);

    const promptFunction = (message: string) => {
      setTimeout(() => {
        this.friendlies.stop();

        alert(message);

        this.inCombat(false);
      }, 0);
    };

    const reward = Rewards.get(bossName);
    if (reward) {
      promptFunction(
        "Good job. You've unlocked the '" +
          reward.healName +
          "' spell. It may come in handy against " +
          reward.bossName +
          "."
      );

      this.player.actions.push(reward.healName);
      this.player.maxMana(Math.round(this.player.maxMana() * 1.2));
      this.friendlies.members.forEach((friendly) =>
        friendly.maxHealth(Math.round(friendly.maxHealth() * 1.1))
      );

      this.friendlies.reset();
      this.player.restoreManaToMax();

      this.boss(
        BossFactory.create(
          reward.bossName,
          this.player,
          this.friendlies.members[0],
          this.friendlies,
          this._onBossKill
        )
      );
    } else {
      promptFunction("You win!");
    }
  };

  private _onFriendlyAttack = (damageModifier: number) => {
    return ((innerDamageModifier: number) => {
      return (friendly: Friendly) => {
        const isCrit = Math.random() < 0.2;
        let attackAmount =
          innerDamageModifier * Random.fromIntegerIntervalInclusive(50, 80);

        if (isCrit) {
          attackAmount = attackAmount * 2;
        }

        attackAmount = Math.round(attackAmount);

        const attacks = isCrit ? "crits" : "attacks";
        const message = `${friendly.name} ${attacks} ${
          this.boss().name
        } for ${attackAmount}`;

        this.addLog(message);
        this.boss().harm(attackAmount);
      };
    })(damageModifier || 1);
  };

  private _onFriendlyDeath = (friendly: Friendly) => {
    this.addLog(`${friendly.name} died.`);

    friendly.stop();

    if (this.player.target() === friendly) {
      this.player.setTarget(undefined);
    }

    this.boss().onDeathOfFriendly(friendly);

    if (this.friendlies.isWiped()) {
      setTimeout(() => {
        this.friendlies.stop();
        this.boss().stop();
        this.pause();

        alert("You lose!");

        this.inCombat(false);
        this.friendlies.reset();
        this.player.restoreManaToMax();

        this.boss().reset();
        this.resume();
      }, 0);

      return;
    }
  };

  addLog = (message: string) => {
    console.log(message);
  };

  allowPause: boolean = document.location.protocol === "file:";
  allowSkip: boolean = document.location.protocol === "file:";
  animations: typeof Animations = Animations;
  boss: ko.Observable<Boss>;
  cancelCast = () => {
    const currentCast = this.player.currentCast.value();
    if (currentCast && !currentCast.isInstant) {
      currentCast.cancel();
    }
  };

  cast = (actionName: ActionName) => {
    if (this.isPaused()) {
      return;
    }

    const target = this.player.target();
    if (!target) {
      return;
    }

    const healParams = {
      critChance: this.player.critChance(),
      onFinish: this._finishCast,
      onCancel: this.player.cancelCast,
    };

    const heal = HealFactory.create(actionName, target, healParams);
    if (this.player.mana() < heal.manaCost) {
      // Out of mana
      return;
    }

    this.player.cast(heal);
  };

  engageBoss = () => {
    this.addLog(`${this.boss().name} engaged.`);
    this.boss().engage();
    this.friendlies.start();
    this.inCombat(true);
  };

  friendlies: Party;
  inCombat: ko.Observable<boolean>;
  isPaused: ko.Observable<boolean>;
  joinGroupButton_onClick = () => {
    this.showIntro(false);
  };

  pause = () => {
    this.isPaused(true);

    this.boss().pause();
    this.friendlies.pause();

    AnimationHelpers.pause();
  };

  player: Player;
  resetStats_onClick = () => {
    this.stats.reset();
  };

  resume = () => {
    this.isPaused(false);

    this.boss().resume();
    this.friendlies.resume();

    AnimationHelpers.resume();
  };

  showBuff = (buff: Buff, member: Friendly) => {
    this.player.setTarget(member);
  };

  showDebuff = (debuff: Debuff, member: Friendly) => {
    this.player.setTarget(member);
  };

  showIntro: ko.Observable<boolean>;
  showStats: ko.Observable<boolean>;
  skip = () => {
    this.boss().stop();
    this._onBossKill();
  };
  stats = Stats;
  toggleStatsLink = ko.pureComputed<string>(() => {
    return this.showStats() ? "Hide stats" : "Show stats";
  });
  toggleStats_onClick = () => {
    this.showStats(!this.showStats());
  };

  constructor() {
    this.showIntro = ko.observable(true);
    this.showStats = ko.observable(false);
    this.isPaused = ko.observable(false);
    this.inCombat = ko.observable(false);

    this.player = new Player(
      {
        health: 109,
        attackInterval: 30000,
        onAttack: this._onFriendlyAttack(2),
        onDeath: this._onFriendlyDeath,
      },
      1081,
      [ActionName.SmallHeal]
    );

    const tank = new Friendly("Tank", {
      health: 212,
      attackInterval: 400,
      onAttack: this._onFriendlyAttack(1),
      onDeath: this._onFriendlyDeath,
    });

    this.friendlies = new Party([
      tank,
      new Friendly("DPS #1", {
        health: 127,
        attackInterval: 1000,
        initialAttackDelay: 4000,
        onAttack: this._onFriendlyAttack(3.2),
        onDeath: this._onFriendlyDeath,
      }),
      new Friendly("DPS #2", {
        health: 113,
        attackInterval: 1200,
        initialAttackDelay: 3500,
        onAttack: this._onFriendlyAttack(3.0),
        onDeath: this._onFriendlyDeath,
      }),
      new Friendly("DPS #3", {
        health: 141,
        attackInterval: 1400,
        initialAttackDelay: 3000,
        onAttack: this._onFriendlyAttack(2.8),
        onDeath: this._onFriendlyDeath,
      }),
      this.player,
    ]);

    this.boss = ko.observable<Boss>(
      BossFactory.create(
        BossName.GordoRamzee,
        this.player,
        tank,
        this.friendlies,
        this._onBossKill
      )
    );

    ko.utils.registerEventHandler(
      document as any,
      "keydown",
      this._document_onKeyPress
    );
  }
}

export default { viewModel: GameViewModel, template: GamePageHtml };
