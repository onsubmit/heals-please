"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const velocity_animate_1 = require("velocity-animate");
class AnimationHelpers {
    constructor() {
        this.fullWidth = { width: "100%" };
        this.zeroWidth = { width: "0%" };
        this.removeStyleAttribute = (elements) => {
            elements[0].removeAttribute("style");
        };
        this.pause = () => {
            const animatingElements = Array.from(document.querySelectorAll(".velocity-animating"));
            (0, velocity_animate_1.Velocity)(animatingElements, "pause");
            return animatingElements;
        };
        this.resume = () => {
            const pausedElements = Array.from(document.querySelectorAll(".velocity-animating"));
            (0, velocity_animate_1.Velocity)(pausedElements, "resume");
            return pausedElements;
        };
        this.makeUpdateProgressFunction = (updateProgressFunction) => {
            return function (elements, complete, remaining, start, tweenValue) {
                updateProgressFunction({
                    complete: complete,
                    remaining: remaining,
                    start: start,
                    tweenValue: tweenValue,
                });
            };
        };
    }
}
exports.default = new AnimationHelpers();
//# sourceMappingURL=AnimationHelpers.js.map