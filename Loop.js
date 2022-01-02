"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loop = void 0;
var LoopState;
(function (LoopState) {
    LoopState[LoopState["Stopped"] = 0] = "Stopped";
    LoopState[LoopState["Paused"] = 1] = "Paused";
    LoopState[LoopState["Running"] = 2] = "Running";
})(LoopState || (LoopState = {}));
class Loop {
    constructor(name, callback, delay, startDelay) {
        this._timerId = -1;
        this._timerRemaining = -1;
        this._timerStart = -1;
        this._state = LoopState.Stopped;
        this.pause = () => {
            if (this._state !== LoopState.Running) {
                return;
            }
            this._timerRemaining -= new Date().getTime() - this._timerStart;
            clearTimeout(this._timerStart);
            this._timerStart = -1;
            this._state = LoopState.Paused;
        };
        this.resume = () => {
            if (this._state !== LoopState.Paused) {
                return;
            }
            this._state = LoopState.Running;
            this._loop(this._timerRemaining);
        };
        this.stop = () => {
            this._timerStart = -1;
            this._timerRemaining = -1;
            clearTimeout(this._timerId);
            this._timerId = -1;
            this._state = LoopState.Stopped;
        };
        this.start = () => {
            this._state = LoopState.Running;
            if (this.startDelay) {
                setTimeout(this._loop, this.startDelay);
            }
            else {
                this._loop();
            }
        };
        this._loop = (delayOverride) => {
            const self = this;
            (function runLoopIteration(innerDelayOverride) {
                self._timerStart = new Date().getTime();
                self._timerRemaining =
                    innerDelayOverride ||
                        (typeof self.delay === "function" ? self.delay() : self.delay);
                self._timerId = setTimeout(() => {
                    if (self._state === LoopState.Running) {
                        self.callback();
                    }
                    // The callback could have paused/stopped the loop.
                    if (self._state === LoopState.Running) {
                        runLoopIteration();
                    }
                }, self._timerRemaining);
            })(delayOverride);
        };
        this.name = name;
        this.callback = callback;
        this.delay = delay;
        this.startDelay = startDelay || 0;
    }
}
exports.Loop = Loop;
//# sourceMappingURL=Loop.js.map