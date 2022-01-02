"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renew = void 0;
const AnimationHelpers_1 = __importDefault(require("../AnimationHelpers"));
const Heal_1 = require("../Heal");
const HotBuff_1 = require("../HotBuff");
class Renew extends Heal_1.Heal {
    constructor(target, params) {
        super(target, params);
        this.name = "Renew";
        this.manaCost = 80;
        this.castTime = 250;
        this.getOutcome = () => {
            manaSpent: true;
        };
        this.cast = () => {
            var renewBuff = new HotBuff_1.HotBuff({
                name: "Renew",
                description: "The target feels renewed, gaining health over time.",
                //icon: require("images/renew.svg"),
                effect: (renewTarget) => {
                    var isCrit = Math.random() < this._critChance;
                    var healAmount = 8;
                    if (isCrit) {
                        healAmount = Math.round(healAmount * this._critMultiplier);
                    }
                    renewTarget.heal(healAmount, isCrit);
                },
            });
            this.target.applyBuff(renewBuff);
        };
        this.begin = (elements) => {
            AnimationHelpers_1.default.removeStyleAttribute(elements);
            this.cast();
        };
        this.isInstant = true;
        this._critChance = 0.1;
        this._critMultiplier = 1.5;
    }
}
exports.Renew = Renew;
//# sourceMappingURL=Renew.js.map