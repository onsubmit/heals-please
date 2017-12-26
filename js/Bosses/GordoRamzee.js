var RequireHelper = require("js/RequireHelper");
var Boss = require("js/Boss");
var Random = require("js/Random");
var Loops = require("js/Loops");
var Loop = require("js/Loop");
var Actions = RequireHelper.requireAll(require.context("./GordoRamzee/Actions/", false, /\.js$/));

GordoRamzee.id = GordoRamzee.prototype.name = "Gordo Ramzee";

function GordoRamzee()
{
    Boss.call(this, 60000);

    var _this = this;

    var _tank = null;
    var _raid = null;

    _this.engage = function (player, tank, raid, onDeathCallback)
    {
        // The encounter begins and Gordo Ramzee is not pleased he is being interrupted.
        // He targets the tank and does 20-25 damage every 2-4 seconds.
        // Every 10 seconds, he throws food, hitting 2 members of the party, damaging each between 12-18.
        // Affected party members eat the food. I mean, who wouldn't?
        // There's a 50% chance the food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.
        // Every 30 seconds, he enrages and all damage done to the party is doubled for 5 seconds.

        _tank = tank;
        _raid = raid;
        _this.targets.push(_tank);

        var loops = new Loops(
            new Loop("Attack Tank", _attackTank, function () { return 1000 * Random.fromFloatInterval(2, 4); }),
            new Loop("Throw Food", _throwFood, 10000));

        _this.initialize(loops, onDeathCallback);
        _this.start();
    };

    function _attackTank()
    {
        _this.targets([_tank]);
        var attackTankAmount = Random.fromIntegerIntervalInclusive(20, 25);
        _tank.harm(attackTankAmount);
    }

    function _throwFood()
    {
        _this.getLoop("Attack Tank").pause();

        var throwFoodTargets = _raid.getRandomMembers(2);
        _this.targets(throwFoodTargets);

        var throwFood = new Actions["Throw Food"](
            throwFoodTargets,
            function ()
            {
                _this.currentCast(null);
                _this.getLoop("Attack Tank").resume();
            }
        );

        _this.currentCast(throwFood);
    }
}

module.exports = GordoRamzee;