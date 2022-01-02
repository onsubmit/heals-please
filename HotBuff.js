"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotBuff = void 0;
const Buff_1 = require("./Buff");
const Loop_1 = require("./Loop");
class HotBuff extends Buff_1.Buff {
    constructor(params) {
        super(params);
        this.start = (target) => {
            super.start(target);
            this._loop.start();
        };
        this.stop = () => {
            this._loop.stop();
        };
        this.resume = () => {
            this._loop.resume();
        };
        this.pause = () => {
            this._loop.pause();
        };
        this._tick = () => {
            this._effect(this._target);
            if (++this._tickCount === this._numTicks) {
                this._loop.stop();
                this._target.removeBuff(this.name);
            }
        };
        this._interval = params.interval || 2000;
        this._tickCount = 0;
        this._numTicks = Math.floor(this._duration / this._interval);
        this._loop = new Loop_1.Loop(params.name, this._tick, this._interval);
    }
}
exports.HotBuff = HotBuff;
//# sourceMappingURL=HotBuff.js.map