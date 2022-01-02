"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Random {
    constructor() {
        this.fromIntegerIntervalInclusive = (min, max) => {
            return Math.round(Math.random() * (max - min + 1) + min);
        };
        this.fromFloatInterval = (min, max) => {
            return (max - min) * Math.random() + min;
        };
        this.nonNegativeIntegerUpToNonInclusive = (max) => {
            return Math.floor(Math.random() * max);
        };
    }
}
exports.default = new Random();
//# sourceMappingURL=Random.js.map