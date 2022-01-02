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
exports.Friendly = void 0;
const ko = __importStar(require("knockout"));
const Loop_1 = require("./Loop");
const Loops_1 = require("./Loops");
const AnimationHelpers_1 = __importDefault(require("./AnimationHelpers"));
const DebuffType_1 = require("./DebuffType");
const HealInfo_1 = require("./HealInfo");
class Friendly {
    constructor(name, params) {
        this.healthPercentage = ko.pureComputed(() => this.health() / this._maxHealth);
        this.healthPercentageString = ko.pureComputed(() => `${100.0 * this.healthPercentage()}%`);
        this.healthStatusString = ko.pureComputed(() => `${this.health()}/${this._maxHealth}`);
        this.lastHealStatusString = ko.pureComputed(() => {
            const lastHealInfo = this.lastHealInfo();
            if (!lastHealInfo || lastHealInfo.targetDied) {
                return "";
            }
            return `+${lastHealInfo.effectiveAmount}`;
        });
        this.animations = {
            fastFadeOut: {
                animation: {
                    properties: "fadeOut",
                    options: {
                        duration: 1000,
                        begin: AnimationHelpers_1.default.removeStyleAttribute,
                    },
                },
            },
        };
        this.heal = (amount, isCrit) => {
            const healInfo = new HealInfo_1.HealInfo(amount, isCrit);
            if (this.isDead()) {
                healInfo.targetDied = true;
            }
            else {
                var overheal = this._adjustHealth(amount);
                healInfo.overheal = overheal;
            }
            this.lastHealInfo(healInfo);
            return healInfo;
        };
        this.healToMax = (allowResurrection) => {
            if (this.isDead() && allowResurrection) {
                this.resurrect(this._maxHealth);
            }
            else {
                this.health(this._maxHealth);
            }
        };
        this.resurrect = (health) => {
            if (this.isDead()) {
                this.isDead(false);
                this.health(health || Math.round(this._maxHealth * 0.2));
            }
        };
        this.harm = (amount) => {
            const debuffs = this._getDebuffsByType(DebuffType_1.DebuffType.IncreaseDamageTaken);
            debuffs.forEach((debuff) => {
                amount = debuff.effect(amount);
            });
            return this._adjustHealth(0 - amount);
        };
        this.applyBuff = (buff) => {
            // Remove any pre-existing buffs by this name.
            this.removeBuff(buff.name);
            buff.start(this);
            this.buffs.push(buff);
        };
        this.removeBuff = (buffNameToRemove) => {
            var removedBuffs = this.buffs.remove((buff) => buff.name === buffNameToRemove);
            if (removedBuffs.length) {
                removedBuffs.forEach((removedBuff) => {
                    removedBuff.stop();
                });
                return true;
            }
            return false;
        };
        this.applyDebuff = (debuff) => {
            debuff.start(this);
            this.debuffs.push(debuff);
        };
        this.removeDebuff = (debuffNameToRemove) => {
            var removedDebuffs = this.debuffs.remove((debuff) => debuff.name === debuffNameToRemove);
            if (removedDebuffs.length) {
                removedDebuffs.forEach((removedDebuff) => {
                    removedDebuff.stop();
                });
                return true;
            }
            return false;
        };
        this.removeLastDebuff = () => {
            this.debuffs.pop().stop();
        };
        this.start = () => {
            this._loops.start();
        };
        this.stop = () => {
            this._loops.stop();
            this.buffs().forEach(function (buff) {
                buff.stop();
            });
            this.debuffs().forEach(function (debuff) {
                debuff.stop();
            });
        };
        this.pause = () => {
            this._loops.pause();
            this.buffs().forEach(function (buff) {
                buff.pause();
            });
            this.debuffs().forEach(function (debuff) {
                debuff.pause();
            });
        };
        this.resume = () => {
            this._loops.resume();
            this.buffs().forEach(function (buff) {
                buff.resume();
            });
            this.debuffs().forEach(function (debuff) {
                debuff.resume();
            });
        };
        this.reset = () => {
            this.healToMax(true);
            this.buffs.removeAll();
            this.debuffs.removeAll();
        };
        this._onDeath = () => {
            this.stop();
            this.buffs.removeAll();
            this.debuffs.removeAll();
            this.isDead(true);
        };
        this._getDebuffsByType = (debuffType) => {
            return this.debuffs().filter((debuff) => debuff.type === debuffType);
        };
        this._adjustHealth = (amount) => {
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
        this._initialize = () => {
            const healthSubscription = this.health.subscribe((currentHealth) => {
                if (currentHealth === 0) {
                    this._onDeath();
                    if (this._onDeathCallback) {
                        this._onDeathCallback(this);
                    }
                    healthSubscription.dispose();
                }
            });
        };
        const health = params.health || 100;
        this.name = name;
        this.health = ko.observable(health);
        this.isDead = ko.observable(false);
        this.buffs = ko.observableArray([]);
        this.debuffs = ko.observableArray([]);
        this.lastHealInfo = ko.observable();
        this.isPlayer = false;
        this._maxHealth = params.maxHealth || health;
        this._initialAttackDelay = params.initialAttackDelay || 0;
        this._attackInterval = params.attackInterval || 1000;
        this._onAttackCallback = params.onAttack;
        this._onDeathCallback = params.onDeath;
        this._loops = new Loops_1.Loops(new Loop_1.Loop("Attack", this._onAttackCallback, this._attackInterval, this._initialAttackDelay));
        this._initialize();
    }
}
exports.Friendly = Friendly;
//# sourceMappingURL=Friendly.js.map