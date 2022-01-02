"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonnyFrump = void 0;
const Boss_1 = require("../Boss");
const Random_1 = __importDefault(require("../Random"));
const Loop_1 = require("../Loop");
const Loops_1 = require("../Loops");
const Trigger_1 = require("../Trigger");
const Enrage_1 = require("./Shared/Actions/Enrage");
const AngryTweet_1 = require("./DonnyFrump/Actions/AngryTweet");
const Uncertainty_1 = require("./DonnyFrump/Actions/Uncertainty");
// The encounter begins and Donny Frump is not pleased people on Twitter are being mean to him.
// He casts Uncertainty on the entire raid, a debuff that does damage over time and
// does more damage as a party member's health decreases.
// He targets the tank and does 15-20 damage every 2-4 seconds.
// Every 10 seconds he sends an angry tweet, hitting 1-3 members of the party, damaging each between 6-20.
// There's a 30% chance the tweet contains egregious misinformation, confusing affected party members further,
// doubling their damage taken for 5 seconds.
// At 20% health, he enrages, soiling his diaper, and all damage done to the tank is doubled.
class DonnyFrump extends Boss_1.Boss {
    constructor(player, tank, raid, onDeathCallback) {
        super(80000, player, tank, raid, onDeathCallback);
        this.initialEvents = [];
        this.initialTargets = [];
        this.onDeathOfFriendly = (friendly) => {
            if (friendly === this._tank) {
                // The tank just died.
                this.targets.remove(this._tank);
                var remainingAlive = this._raid.getLivingMembers();
                if (remainingAlive.length === 0) {
                    this.stop();
                    return;
                }
                if (remainingAlive.length === 1 && remainingAlive[0] === this._player) {
                    // The player is the last one alive.
                    this._tank = this._player;
                }
                else {
                    // Choose some random DPS to become the new tank.
                    this._tank = this._raid.getRandomMembers(1)[0];
                }
                this.targets.push(this._tank);
            }
        };
        this._attackTank = () => {
            this._targetTank();
            var attackTankAmount = Random_1.default.fromIntegerIntervalInclusive(15, 20);
            if (this._isEnraged) {
                attackTankAmount *= 2;
            }
            this._tank.harm(attackTankAmount);
        };
        this._castUncertainty = () => {
            this.targets(this._raid.members);
            var uncertainty = new Uncertainty_1.Uncertainty(this._raid.members, () => {
                this.finishCast(uncertainty);
                this._targetTank();
                this.start();
            });
            this.cast(uncertainty);
        };
        this._angryTweet = () => {
            this._getAttackTankLoop().pause();
            var numTargets = Random_1.default.fromIntegerIntervalInclusive(1, 3);
            var angryTweetTargets = this._raid.getRandomMembers(numTargets, true /* allowPlayer */);
            this.targets(angryTweetTargets);
            var angryTweet = new AngryTweet_1.AngryTweet(angryTweetTargets, () => {
                this.finishCast(angryTweet);
                this._targetTank();
                this._getAttackTankLoop().resume();
            });
            this.cast(angryTweet);
        };
        this._enrage = () => {
            var enrage = new Enrage_1.Enrage(null, // No specific target
            () => {
                this._isEnraged = true;
                this.finishCast(enrage);
                this._targetTank();
            });
            this.cast(enrage);
        };
        this._targetTank = () => {
            this.targets([this._tank]);
        };
        this._getAttackTankLoop = () => {
            return this.getLoop("Attack Tank");
        };
        this._isEnraged = false;
        this.loops = new Loops_1.Loops(new Loop_1.Loop("Attack Tank", this._attackTank, function () {
            return 1000 * Random_1.default.fromIntegerIntervalInclusive(2, 4);
        }), new Loop_1.Loop("Angry Tweet", this._angryTweet, 10000));
        this.initialEvents = [this._castUncertainty];
        this.initialTargets = [this._tank];
        this.triggers = [
            new Trigger_1.Trigger((healthPercentage) => {
                if (healthPercentage <= 20) {
                    this._enrage();
                    return true;
                }
                return false;
            }),
        ];
    }
}
exports.DonnyFrump = DonnyFrump;
//# sourceMappingURL=DonnyFrump.js.map