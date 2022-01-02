"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heal = void 0;
const AnimationHelpers_1 = __importDefault(require("./AnimationHelpers"));
class Heal {
    constructor(target, params) {
        this.cancel = () => {
            var outcome = { wasCancelled: true };
            this._onCancel(this, outcome);
        };
        this.begin = (elements) => {
            AnimationHelpers_1.default.removeStyleAttribute(elements);
        };
        this._updateProgress = (progress) => {
            this.castProgress = progress.complete;
        };
        this._complete = () => {
            var outcome = this.getOutcome();
            this._onFinish(this, outcome);
        };
        this.target = target;
        this.isInstant = false;
        this._onFinish = params.onFinish;
        this._onCancel = params.onCancel;
        this.castProgress = 0.0;
    }
    get animation() {
        return [
            {
                properties: AnimationHelpers_1.default.fullWidth,
                options: {
                    duration: this.castTime,
                    begin: this.begin,
                    progress: AnimationHelpers_1.default.makeUpdateProgressFunction(this._updateProgress),
                    complete: this._complete,
                },
            },
        ];
    }
}
exports.Heal = Heal;
//# sourceMappingURL=Heal.js.map