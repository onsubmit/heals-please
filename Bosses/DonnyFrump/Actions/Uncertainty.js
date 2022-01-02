"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uncertainty = void 0;
const Action_1 = require("../../../Action");
const AnimationHelpers_1 = __importDefault(require("../../../AnimationHelpers"));
const DotDebuff_1 = require("../../../DotDebuff");
class Uncertainty extends Action_1.Action {
    constructor(targets, onSuccess) {
        super("Uncertainty");
        this._cast = () => {
            this.targets.forEach(function (target) {
                var uncertaintyDebuff = new DotDebuff_1.DotDebuff({
                    name: "Uncertainty",
                    description: "Target can't tell what's true anymore. At full health, target takes 1 damage every 2 seconds. Increases to 5 per 2 seconds when near death.",
                    //icon: require("images/uncertainty.svg"),
                    interval: 2000,
                    duration: -1,
                    effect: function (uncertaintyTarget) {
                        // 1 dps @ 100% health
                        // 5 dps @ 0% health
                        var harmAmount = Math.round(-4 * uncertaintyTarget.healthPercentage() + 5);
                        uncertaintyTarget.harm(harmAmount);
                    },
                });
                target.applyDebuff(uncertaintyDebuff);
            });
        };
        this._complete = () => {
            this._cast();
            this._onSuccess();
        };
        this.targets = targets;
        this._onSuccess = onSuccess;
        this.animation = [
            {
                properties: AnimationHelpers_1.default.fullWidth,
                options: {
                    duration: 2000,
                    begin: AnimationHelpers_1.default.removeStyleAttribute,
                    complete: this._complete,
                },
            },
        ];
    }
}
exports.Uncertainty = Uncertainty;
//# sourceMappingURL=Uncertainty.js.map