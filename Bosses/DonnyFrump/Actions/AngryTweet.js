"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngryTweet = void 0;
const Action_1 = require("../../../Action");
const AnimationHelpers_1 = __importDefault(require("../../../AnimationHelpers"));
const Debuff_1 = require("../../../Debuff");
const DebuffType_1 = require("../../../DebuffType");
const Random_1 = __importDefault(require("../../../Random"));
class AngryTweet extends Action_1.Action {
    constructor(targets, onSuccess) {
        super("Angry Tweet");
        this._cast = () => {
            this.targets.forEach(function (target) {
                var harmAmount = Random_1.default.fromIntegerIntervalInclusive(6, 20);
                target.harm(harmAmount);
                if (!target.isDead() && Math.random() < 0.3) {
                    var confusionDebuff = new Debuff_1.Debuff({
                        name: "Confusion",
                        description: "Damage taken is doubled for 5 seconds.",
                        type: DebuffType_1.DebuffType.IncreaseDamageTaken,
                        //icon: require("images/confusion.svg"),
                        duration: 5000,
                        effect: (damage) => {
                            // Damage taken is doubled.
                            return damage * 2.0;
                        },
                    });
                    target.applyDebuff(confusionDebuff);
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
exports.AngryTweet = AngryTweet;
//# sourceMappingURL=AngryTweet.js.map