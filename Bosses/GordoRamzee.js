"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GordoRamzee = void 0;
const Boss_1 = require("../Boss");
const Random_1 = __importDefault(require("../Random"));
const Loop_1 = require("../Loop");
const Loops_1 = require("../Loops");
const Trigger_1 = require("../Trigger");
const Enrage_1 = require("./Shared/Actions/Enrage");
const ThrowFood_1 = require("./GordoRamzee/Actions/ThrowFood");
// The encounter begins and Gordo Ramzee is not pleased he is being interrupted.
// He targets the tank and does 20-25 damage every 2-4 seconds.
// Every 10 seconds, he throws food, hitting 2 members of the party, damaging each between 12-18.
// Affected party members eat the food. I mean, who wouldn't?
// There's a 50% chance the food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.
// At 20% health, he enrages and all damage done to the tank is doubled.
class GordoRamzee extends Boss_1.Boss {
    constructor(player, tank, raid, onDeathCallback) {
        super(60000, player, tank, raid, onDeathCallback);
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
                    this._tank = this._raid.getRandomMembers(1, false /* allowPlayer */)[0];
                }
                this.targets.push(this._tank);
            }
        };
        this._attackTank = () => {
            this._targetTank();
            var attackTankAmount = Random_1.default.fromIntegerIntervalInclusive(20, 25);
            if (this._isEnraged) {
                attackTankAmount *= 2;
            }
            this._tank.harm(attackTankAmount);
        };
        this._throwFood = () => {
            this._getAttackTankLoop().pause();
            var throwFoodTargets = this._raid.getRandomMembers(2, true /* allowPlayer */);
            this.targets(throwFoodTargets);
            var throwFood = new ThrowFood_1.ThrowFood(throwFoodTargets, () => {
                this.finishCast(throwFood);
                this._targetTank();
                this._getAttackTankLoop().resume();
            });
            this.cast(throwFood);
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
        }), new Loop_1.Loop("Throw Food", this._throwFood, 10000));
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
exports.GordoRamzee = GordoRamzee;
//# sourceMappingURL=GordoRamzee.js.map