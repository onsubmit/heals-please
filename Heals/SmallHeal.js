"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmallHeal = void 0;
const Heal_1 = require("../Heal");
const Random_1 = __importDefault(require("../Random"));
class SmallHeal extends Heal_1.Heal {
    constructor(target, params) {
        super(target, params);
        this.name = "Small Heal";
        this.manaCost = 40;
        this.castTime = 1000;
        this.getOutcome = () => this.cast();
        this.cast = () => {
            var isCrit = Math.random() < this._critChance;
            var healAmount = Random_1.default.fromIntegerIntervalInclusive(18, 24);
            if (isCrit) {
                healAmount = Math.round(healAmount * this._critMultiplier);
            }
            return this.target.heal(healAmount, isCrit);
        };
        this._critChance = 0.1;
        this._critMultiplier = 1.5;
    }
}
exports.SmallHeal = SmallHeal;
//# sourceMappingURL=SmallHeal.js.map