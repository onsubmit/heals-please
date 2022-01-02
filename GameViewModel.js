"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ko = __importStar(require("knockout"));
const Friendly_1 = require("./Friendly");
const SmallHeal_1 = require("./Heals/SmallHeal");
const Player_1 = require("./Player");
const Party_1 = require("./Party");
const Random_1 = __importDefault(require("./Random"));
const AnimationHelpers_1 = __importDefault(require("./AnimationHelpers"));
const PreviousValueTracker_1 = require("./PreviousValueTracker");
const GordoRamzee_1 = require("./Bosses/GordoRamzee");
//import template from "../html/GamePageHtml.html";
//require("../css/app.less");
class GameViewModel {
    constructor() {
        this._queuedAction = null;
        this.showIntro = ko.observable(true);
        this.isPaused = ko.observable(false);
        this.inCombat = ko.observable(false);
        this.boss = ko.observable(null);
        this.allowPause = false;
        this.currentCast = ko.utils.extend(new PreviousValueTracker_1.PreviousValueTracker(), {
            action: ko.observable().extend({ notify: "always" }),
        });
        this.animations = {
            fadeOutCastBar: {
                animation: {
                    properties: "fadeOut",
                    options: {
                        duration: 200,
                        complete: AnimationHelpers_1.default.removeStyleAttribute,
                    },
                },
            },
        };
        this.cast = (actionName) => {
            if (this.isPaused()) {
                return;
            }
            var target = this.player.target();
            if (!target) {
                return;
            }
            var healParams = {
                critChance: this.player.critChance(),
                onFinish: this._finishCast,
                onCancel: this._cancelCast,
            };
            const heal = new SmallHeal_1.SmallHeal(target, healParams);
            if (this.player.mana() < heal.manaCost) {
                // Out of mana
                return;
            }
            var currentCast = this.currentCast.value();
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
        this.cancelCast = () => {
            var currentCast = this.currentCast.value();
            if (currentCast && !currentCast.isInstant) {
                currentCast.cancel();
            }
        };
        this.engageBoss = () => {
            this.boss().engage();
            this.friendlies.start();
            this.inCombat(true);
        };
        this.showBuff = (buff, member) => {
            this.player.setTarget(member);
        };
        this.showDebuff = (debuff, member) => {
            this.player.setTarget(member);
        };
        this.pause = () => {
            this.isPaused(true);
            this.boss().pause();
            this.friendlies.pause();
            AnimationHelpers_1.default.pause();
        };
        this.resume = () => {
            this.isPaused(false);
            this.boss().resume();
            this.friendlies.resume();
            AnimationHelpers_1.default.resume();
        };
        this.joinGroupButton_onClick = () => {
            this.showIntro(false);
        };
        this._castAction = (action) => {
            if (action.isInstant) {
                this.player.spendMana(action.manaCost);
            }
            this.currentCast.action("finish");
            this.currentCast.value(action);
        };
        this._finishCast = (action, outcome) => {
            if (!outcome.manaSpent && !outcome.targetDied) {
                this.player.spendMana(action.manaCost);
            }
            if (this._queuedAction) {
                this._castAction(this._queuedAction);
                this._queuedAction = null;
            }
            else {
                this.currentCast.value(null);
            }
        };
        this._cancelCast = () => {
            this._queuedAction = null;
            this.currentCast.action("stop");
            this.currentCast.value(null);
        };
        this._onFriendlyAttack = (damageModifier) => {
            return ((innerDamageModifier) => {
                return () => {
                    var isCrit = Math.random() < 0.2;
                    var attackAmount = innerDamageModifier * Random_1.default.fromIntegerIntervalInclusive(50, 80);
                    if (isCrit) {
                        attackAmount = Math.round(attackAmount * 2);
                    }
                    this.boss().harm(attackAmount);
                };
            })(damageModifier || 1);
        };
        this._onFriendlyDeath = (friendly) => {
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
                    //this.boss(new Bosses[_this.boss().name]());
                }, 0);
                return;
            }
        };
        this._onBossKill = () => {
            var bossName = this.boss().name;
            // {
            //   GordoRamzee: {
            //     heal: Renew,
            //     boss: DonnyFrump,
            //   },
            // };
            //var reward = this._rewards[bossName];
            var promptFunction = (message) => {
                setTimeout(() => {
                    this.friendlies.stop();
                    alert(message);
                    this.inCombat(false);
                    this.friendlies.reset();
                    this.player.restoreManaToMax();
                }, 0);
            };
            // if (reward) {
            //   promptFunction(
            //     "Good job. You've unlocked the '" +
            //       reward.heal +
            //       "' spell. It may come in handy against " +
            //       reward.boss +
            //       "."
            //   );
            //   this.player.actions.push(reward.heal);
            //   //_this.boss(new Bosses[reward.boss]());
            // } else {
            promptFunction("You win!");
            // }
        };
        this._document_onKeyPress = (e) => {
            const keyboardEvent = e;
            var keyCode = keyboardEvent.keyCode;
            if (keyCode === 27) {
                // ESC
                this.cancelCast();
            }
            if (keyCode === 32) {
                // SPACE
                var previousCast = this.currentCast.previous();
                if (previousCast && previousCast.name) {
                    this.cast(previousCast.name);
                }
            }
            else if (keyCode >= 48 && keyCode <= 57) {
                // 0-9
                var actionIndex = keyCode - 49; // - '0' - 1
                var action = this.player.getActionByIndex(actionIndex);
                if (action) {
                    this.cast(action);
                }
            }
            else {
                var partyIndex = -1;
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
                var member = this.friendlies.getMemberByIndex(partyIndex);
                if (member) {
                    this.player.setTarget(member);
                }
            }
        };
        this.player = new Player_1.Player({
            actions: [SmallHeal_1.SmallHeal],
            attackInterval: 30000,
            onAttack: this._onFriendlyAttack(2),
            onDeath: this._onFriendlyDeath,
        });
        this.friendlies = new Party_1.Party([
            new Friendly_1.Friendly("Tank", {
                health: 200,
                attackInterval: 400,
                onAttack: this._onFriendlyAttack(1),
                onDeath: this._onFriendlyDeath,
            }),
            new Friendly_1.Friendly("DPS #1", {
                attackInterval: 1000,
                initialAttackDelay: 4000,
                onAttack: this._onFriendlyAttack(3.2),
                onDeath: this._onFriendlyDeath,
            }),
            new Friendly_1.Friendly("DPS #2", {
                attackInterval: 1200,
                initialAttackDelay: 3500,
                onAttack: this._onFriendlyAttack(3.0),
                onDeath: this._onFriendlyDeath,
            }),
            new Friendly_1.Friendly("DPS #3", {
                attackInterval: 1400,
                initialAttackDelay: 3000,
                onAttack: this._onFriendlyAttack(2.8),
                onDeath: this._onFriendlyDeath,
            }),
            this.player,
        ]);
        var tank = this.friendlies.members[0];
        this.boss(new GordoRamzee_1.GordoRamzee(this.player, tank, this.friendlies, this._onBossKill));
        ko.utils.registerEventHandler(document, "keydown", this._document_onKeyPress);
    }
}
exports.default = { viewModel: GameViewModel, template: "<h1>Hi</h1>" };
//# sourceMappingURL=GameViewModel.js.map