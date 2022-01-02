"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealInfo = void 0;
class HealInfo {
    constructor(amount, isCrit) {
        this._overheal = 0;
        this._manaSpent = 0;
        this._targetDied = false;
        this.amount = amount;
        this.isCrit = isCrit;
    }
    set overheal(value) {
        this._overheal = value;
    }
    set manaSpent(value) {
        this._manaSpent = value;
    }
    set targetDied(value) {
        this._targetDied = value;
    }
    get effectiveAmount() {
        return this.amount - this._overheal;
    }
}
exports.HealInfo = HealInfo;
//# sourceMappingURL=HealInfo.js.map