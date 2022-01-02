"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buff = void 0;
const Loop_1 = require("./Loop");
class Buff {
    constructor(params) {
        this._applied = false;
        this.start = (target) => {
            this._target = target;
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
            if (!this._applied) {
                this._effect(this._target);
                this._applied = true;
            }
            else {
                this._loop.stop();
                this._target.removeBuff(this.name);
            }
        };
        const name = params.name || "Missing name";
        this.name = name;
        this.description = params.description || "Missing description";
        this._duration = params.duration || 10000;
        this._effect = params.effect;
        this.icon = params.icon;
        this._target = null;
        this._loop = new Loop_1.Loop(name, this._tick, this._duration);
    }
    get tooltip() {
        return `${this.name} -> ${this.description}`;
    }
}
exports.Buff = Buff;
//# sourceMappingURL=Buff.js.map