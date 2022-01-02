"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrage = void 0;
const Action_1 = require("../../../Action");
const AnimationHelpers_1 = __importDefault(require("../../../AnimationHelpers"));
class Enrage extends Action_1.Action {
    constructor(targets, onSuccess) {
        super("Enrage");
        this.animation = [
            {
                properties: AnimationHelpers_1.default.fullWidth,
                options: {
                    duration: 5000,
                    begin: AnimationHelpers_1.default.removeStyleAttribute,
                    complete: onSuccess,
                },
            },
        ];
    }
}
exports.Enrage = Enrage;
//# sourceMappingURL=Enrage.js.map