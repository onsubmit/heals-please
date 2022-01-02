"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyExtensions = void 0;
const velocity_animate_1 = require("velocity-animate");
function applyExtensions(ko) {
    ko.bindingHandlers.animate = {
        update: function (element, valueAccessor) {
            var currentCast = valueAccessor();
            if (!currentCast) {
                return;
            }
            ko.utils.arrayForEach([].concat(currentCast.animation), function (animationStep) {
                (0, velocity_animate_1.Velocity)(element, animationStep.properties, animationStep.options);
            });
        },
    };
    ko.bindingHandlers.animateAction = {
        update: function (element, valueAccessor) {
            var action = ko.unwrap(valueAccessor());
            if (!action) {
                return;
            }
            ko.bindingHandlers.animate.update(element, function () {
                return { animation: { properties: action } };
            });
        },
    };
}
exports.applyExtensions = applyExtensions;
//# sourceMappingURL=KnockoutExtensions.js.map