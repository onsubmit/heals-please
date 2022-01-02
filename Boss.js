"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boss = void 0;
const ko = __importStar(require("knockout"));
const PreviousValueTracker_1 = require("./PreviousValueTracker");
class Boss {
    constructor(health, player, tank, raid, onDeathCallback) {
        this.healthPercentageString = ko.pureComputed(() => `${(100.0 * this.health()) / this.maxHealth}%`);
        this.engage = () => {
            this.initialEvents.forEach((initialEvent) => {
                initialEvent();
            });
            this.targets(Object.assign([], this.initialTargets));
            this.start();
        };
        this.harm = (amount) => this._adjustHealth(0 - amount);
        this.getLoop = (loopName) => this.loops.get(loopName);
        this.cast = (action) => {
            this.currentCasts.push(ko.utils.extend(new PreviousValueTracker_1.PreviousValueTracker(action), {
                action: ko.observable().extend({ notify: "always" }),
                name: "foo",
            }));
        };
        this.finishCast = (action) => {
            this.currentCasts.remove((cast) => {
                return cast.value() === action;
            });
        };
        this.start = () => {
            this.loops.start();
        };
        this.stop = () => {
            this.targets.removeAll();
            this.loops.stop();
            this.currentCasts().forEach((cast) => {
                cast.action("finish");
            });
        };
        this.pause = () => {
            this.loops.pause();
        };
        this.resume = () => {
            this.loops.resume();
        };
        this._adjustHealth = (amount) => {
            var newHealth = this.health() + amount;
            if (newHealth <= 0) {
                this.health(0);
                this._updateProgress(0);
                this._onDeath();
            }
            else if (newHealth <= this.maxHealth) {
                this.health(newHealth);
                this._updateProgress((100.0 * newHealth) / this.maxHealth);
            }
            else {
                this.health(this.maxHealth);
                this._updateProgress(100);
            }
        };
        this._updateProgress = (healthPercentage) => {
            this.triggers.forEach((trigger) => {
                trigger.execute(healthPercentage);
            });
        };
        this._onDeath = () => {
            this.stop();
            this.isDead(true);
            this._onDeathCallback();
        };
        this.health = ko.observable(health);
        this.isDead = ko.observable(false);
        this.targets = ko.observableArray([]);
        this.currentCasts = ko.observableArray([]);
        this.maxHealth = health;
        this._player = player;
        this._tank = tank;
        this._raid = raid;
        this._onDeathCallback = onDeathCallback;
    }
}
exports.Boss = Boss;
//# sourceMappingURL=Boss.js.map