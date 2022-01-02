"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowFood = void 0;
const Action_1 = require("../../../Action");
const AnimationHelpers_1 = __importDefault(require("../../../AnimationHelpers"));
const DotDebuff_1 = require("../../../DotDebuff");
const Random_1 = __importDefault(require("../../../Random"));
class ThrowFood extends Action_1.Action {
    constructor(targets, onSuccess) {
        super("Throw Food");
        this._cast = () => {
            this.targets.forEach(function (target) {
                var harmAmount = Random_1.default.fromIntegerIntervalInclusive(12, 18);
                target.harm(harmAmount);
                if (!target.isDead() && Math.random() < 0.5) {
                    var foodPoisoningDebuff = new DotDebuff_1.DotDebuff({
                        name: "Food Poisoning",
                        description: "The food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.",
                        //icon: require("images/food-poisoning.svg"),
                        interval: 1000,
                        duration: 5000,
                        effect: function (foodPoisoningTarget) {
                            var foodPoisoningHarmAmount = Random_1.default.fromIntegerIntervalInclusive(8, 16);
                            foodPoisoningTarget.harm(foodPoisoningHarmAmount);
                        },
                    });
                    target.applyDebuff(foodPoisoningDebuff);
                }
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
exports.ThrowFood = ThrowFood;
//# sourceMappingURL=ThrowFood.js.map