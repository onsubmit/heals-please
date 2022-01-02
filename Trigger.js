"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trigger = void 0;
class Trigger {
    constructor(callback) {
        this._triggered = false;
        this.execute = (healthPercentage) => {
            if (!this._triggered) {
                this._triggered = this._callback(healthPercentage);
            }
        };
        this._callback = callback;
    }
}
exports.Trigger = Trigger;
//# sourceMappingURL=Trigger.js.map