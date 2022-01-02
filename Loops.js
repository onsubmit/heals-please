"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loops = void 0;
class Loops {
    constructor(...loops) {
        this._loops = new Map();
        this.get = (loopName) => {
            const loop = this._loops.get(loopName);
            if (!loop) {
                throw `Cannot find loop named ${loopName}`;
            }
            return loop;
        };
        this.start = () => {
            this._loops.forEach((loop) => {
                loop.start();
            });
        };
        this.stop = () => {
            this._loops.forEach((loop) => {
                loop.stop();
            });
        };
        this.pause = () => {
            this._loops.forEach((loop) => {
                loop.pause();
            });
        };
        this.resume = () => {
            this._loops.forEach((loop) => {
                loop.resume();
            });
        };
        for (let loop of loops) {
            this._loops.set(loop.name, loop);
        }
    }
}
exports.Loops = Loops;
//# sourceMappingURL=Loops.js.map