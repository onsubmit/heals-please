"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotDebuff = void 0;
const Debuff_1 = require("./Debuff");
const Loop_1 = require("./Loop");
class DotDebuff extends Debuff_1.Debuff {
    constructor(params) {
        super(params);
        this._tick = () => {
            this._effect(this._target);
            if (this._duration > 0 && ++this._tickCount === this._numTicks) {
                this._loop.stop();
                this._target.removeDebuff(this.name);
            }
        };
        this._interval = params.interval || 2000;
        this._tickCount = 0;
        this._numTicks = Math.floor(this._duration / this._interval);
        this._loop = new Loop_1.Loop(params.name, this._tick, this._interval);
    }
}
exports.DotDebuff = DotDebuff;
//# sourceMappingURL=DotDebuff.js.map