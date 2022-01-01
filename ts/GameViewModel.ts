import * as ko from "knockout";
import "../css/app.less";
import GamePageHtml from "../html/GamePage.html";
import AnimationHelpers from "./AnimationHelpers";
import Boss from "./Boss";
import GordoRamzee from "./Bosses/GordoRamzee";
import DonnyFrump from "./Bosses/DonnyFrump";
import Buff from "./Buff";
import Debuff from "./Debuff";
import Friendly from "./Friendly";
import Heal from "./Heal";
import HealFactory from "./HealFactory";
import Party from "./Party";
import Player from "./Player";
import PreviousValueTracker from "./PreviousValueTracker";
import Random from "./Random";
import { ActionName } from "./ActionName";
import HealOutcome from "./HealOutcome";

class GameViewModel {
  private _cancelCast = () => {
    this._queuedAction = null;
    this.currentCast.action("stop");
    this.currentCast.value(null);
  };

  private _castAction = (action: Heal) => {
    if (action.isInstant) {
      this.player.spendMana(action.manaCost);
    }

    this.currentCast.action("finish");
    this.currentCast.value(action);
  };

  private _document_onKeyPress = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    const keyCode = keyboardEvent.keyCode;

    if (keyCode === 27) {
      // ESC
      this.cancelCast();
    }
    if (keyCode === 32) {
      // SPACE
      const previousCast = this.currentCast.previous();
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
      }

      const member = this.friendlies.getMemberByIndex(partyIndex);
      if (member) {
        this.player.setTarget(member);
      }
    }
  };

  private _finishCast = (action: Heal, outcome: HealOutcome) => {
    if (!outcome.manaSpent && !outcome.targetDied) {
      this.player.spendMana(action.manaCost);
    }

    if (this._queuedAction) {
      this._castAction(this._queuedAction);
      this._queuedAction = null;
    } else {
      this.currentCast.value(null);
    }
  };

  private _onBossKill = () => {
    const bossName = this.boss().name;

    let heal: ActionName | undefined;
    let boss: Boss | undefined;
    switch (bossName) {
      case "Gordo Ramzee":
        heal = ActionName.Renew;
        boss = new DonnyFrump(
          this.player,
          this.friendlies.members[0],
          this.friendlies,
          this._onBossKill
        );
    }

    const promptFunction = (message: string) => {
      setTimeout(() => {
        this.friendlies.stop();

        alert(message);

        this.inCombat(false);
        this.friendlies.reset();
        this.player.restoreManaToMax();
      }, 0);
    };

    if (heal && boss) {
      promptFunction(
        "Good job. You've unlocked the '" +
          heal +
          "' spell. It may come in handy against " +
          boss.name +
          "."
      );

      this.player.actions.push(heal);
      this.boss(boss);
    } else {
      promptFunction("You win!");
    }
  };

  private _onFriendlyAttack = (damageModifier: number) => {
    return ((innerDamageModifier: number) => {
      return () => {
        const isCrit = Math.random() < 0.2;
        let attackAmount =
          innerDamageModifier * Random.fromIntegerIntervalInclusive(50, 80);

        if (isCrit) {
          attackAmount = Math.round(attackAmount * 2);
        }

        this.boss().harm(attackAmount);
      };
    })(damageModifier || 1);
  };

  private _onFriendlyDeath = (friendly: Friendly) => {
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

  private _queuedAction: Heal | null = null;

  // = ko.observable(null);
  allowPause: boolean = false;
  animations = {
    fadeOutCastBar: {
      animation: {
        properties: AnimationHelpers.fadeOut,
        options: {
          duration: 200,
          complete: AnimationHelpers.removeStyleAttribute,
        },
      },
    },
  };
  // = ko.observable(false);
  boss: ko.Observable<Boss>;
  cancelCast = () => {
    const currentCast = this.currentCast.value();
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
      onCancel: this._cancelCast,
    };

    const heal = HealFactory.create(actionName, target, healParams);
    if (this.player.mana() < heal.manaCost) {
      // Out of mana
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

    return this._castAction(heal);
  };

  currentCast = ko.utils.extend(new PreviousValueTracker<Heal>(), {
    action: ko.observable().extend({ notify: "always" }),
  });
  engageBoss = () => {
    this.boss().engage();
    this.friendlies.start();
    this.inCombat(true);
  };

  friendlies: Party;
  // = ko.observable(false);
  inCombat: ko.Observable<boolean>;
  // = ko.observable(true);
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

  constructor() {
    this.showIntro = ko.observable(true);
    this.isPaused = ko.observable(false);
    this.inCombat = ko.observable(false);

    this.player = new Player(
      {
        health: 100,
        attackInterval: 30000,
        onAttack: this._onFriendlyAttack(2),
        onDeath: this._onFriendlyDeath,
      },
      1000,
      [ActionName.SmallHeal]
    );

    const tank = new Friendly("Tank", {
      health: 200,
      attackInterval: 400,
      onAttack: this._onFriendlyAttack(1),
      onDeath: this._onFriendlyDeath,
    });

    this.friendlies = new Party([
      tank,
      new Friendly("DPS #1", {
        health: 100,
        attackInterval: 1000,
        initialAttackDelay: 4000,
        onAttack: this._onFriendlyAttack(3.2),
        onDeath: this._onFriendlyDeath,
      }),
      new Friendly("DPS #2", {
        health: 100,
        attackInterval: 1200,
        initialAttackDelay: 3500,
        onAttack: this._onFriendlyAttack(3.0),
        onDeath: this._onFriendlyDeath,
      }),
      new Friendly("DPS #3", {
        health: 100,
        attackInterval: 1400,
        initialAttackDelay: 3000,
        onAttack: this._onFriendlyAttack(2.8),
        onDeath: this._onFriendlyDeath,
      }),
      this.player,
    ]);

    this.boss = ko.observable<Boss>(
      new GordoRamzee(this.player, tank, this.friendlies, this._onBossKill)
    );

    ko.utils.registerEventHandler(
      document as any,
      "keydown",
      this._document_onKeyPress
    );
  }
}

export default { viewModel: GameViewModel, template: GamePageHtml };
