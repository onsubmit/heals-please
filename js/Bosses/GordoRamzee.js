var ko = require("knockout");
var Random = require("js/Random");
var AnimationHelpers = require("js/AnimationHelpers");
var Loops = require("js/Loops");
var Loop = require("js/Loop");
var Actions = require("./GordoRamzee/Actions");

module.exports = new function ()
{
    var _this = this;

    var _tank = null;
    var _raid = null;
    var _loops = null;
    var _onDeathCallback = null;

    _this.name = "Gordo Ramzee";
    _this.targets = ko.observableArray([]);
    _this.currentCast = ko.observable();

    _this.health = ko.utils.extend(ko.observable(1000),
        {
            animation:
            [
                {
                    properties: AnimationHelpers.zeroWidth,
                    options:
                        {
                            duration: 60000,
                            begin: AnimationHelpers.removeStyleAttribute,
                            complete: _onDeath
                        }
                }
            ]
        });

    _this.engage = function (player, tank, raid, onDeathCallback)
    {
        // The encounter begins and Gordo Ramzee is not pleased he is being interrupted.
        // He targets the tank and does 20-25 damage every 2-4 seconds.
        // Every 10 seconds, he throws food, hitting 2 members of the party, damaging each between 12-18.
        // Affected party members eat the food. I mean, who wouldn't?
        // There's a 50% chance the food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.
        // Every 30 seconds, he enrages and all damage done to the party is doubled for 5 seconds.

        _onDeathCallback = onDeathCallback;

        _tank = tank;
        _raid = raid;
        _this.targets.push(_tank);

        _loops = new Loops(
            new Loop("Attack Tank", _attackTank, function () { return 1000 * Random.fromFloatInterval(2, 4); }),
            new Loop("Throw Food", _throwFood, 10000));

        _loops.start();
    };

    _this.pause = function ()
    {
        _loops.pause();
    };

    _this.resume = function ()
    {
        _loops.resume();
    };

    function _attackTank()
    {
        _this.targets([_tank]);
        var attackTankAmount = Random.fromIntegerIntervalInclusive(20, 25);
        _tank.harm(attackTankAmount);
    }

    function _throwFood()
    {
        _loops.get("Attack Tank").pause();

        var throwFoodTargets = _raid.getRandomMembers(2);
        _this.targets(throwFoodTargets);

        var throwFood = new Actions.ThrowFood(
            throwFoodTargets,
            function ()
            {
                _this.currentCast(null);
                _loops.get("Attack Tank").resume();
            }
        );

        _this.currentCast(throwFood);
    }

    function _onDeath()
    {
        _this.targets.removeAll();

        _loops.stop();

        _onDeathCallback();
    }
};