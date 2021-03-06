var RequireHelper = require("js/RequireHelper");
var Boss = require("js/Boss");
var Random = require("js/Random");
var Loop = require("js/Loop");
var Loops = require("js/Loops");
var Trigger = require("js/Trigger");
var Actions = RequireHelper.requireAll(require.context("./GordoRamzee/Actions/", false, /\.js$/));

GordoRamzee.id = GordoRamzee.prototype.name = "Gordo Ramzee";

function GordoRamzee()
{
    Boss.call(this, 60000);

    var _this = this;

    var _player = null;
    var _tank = null;
    var _raid = null;
    var _isEnraged = false;

    _this.engage = function (player, tank, raid, onDeathCallback)
    {
        // The encounter begins and Gordo Ramzee is not pleased he is being interrupted.
        // He targets the tank and does 20-25 damage every 2-4 seconds.
        // Every 10 seconds, he throws food, hitting 2 members of the party, damaging each between 12-18.
        // Affected party members eat the food. I mean, who wouldn't?
        // There's a 50% chance the food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.
        // At 20% health, he enrages and all damage done to the tank is doubled.

        _player = player;
        _tank = tank;
        _raid = raid;

        var loops = new Loops(
            new Loop("Attack Tank", _attackTank, function () { return 1000 * Random.fromIntegerIntervalInclusive(2, 4); }),
            new Loop("Throw Food", _throwFood, 10000));

        var triggers =
            [
                new Trigger(
                    function (healthPercentage)
                    {
                        if (healthPercentage <= 20)
                        {
                            _enrage();
                            return true;
                        }

                        return false;
                    })
            ];

        var bossParams =
            {
                initialTargets: _tank,
                loops: loops,
                triggers: triggers,
                onDeathCallback: onDeathCallback
            };

        _this.initialize(bossParams);
        _this.start();
    };

    _this.onDeathOfFriendly = function (friendly)
    {
        if (friendly === _tank)
        {
            // The tank just died.

            _this.targets.remove(_tank);

            var remainingAlive = _raid.getLivingMembers();
            if (remainingAlive.length === 0)
            {
                _this.stop();
                return;
            }

            if (remainingAlive.length === 1 && remainingAlive[0] === _player)
            {
                // The player is the last one alive.
                _tank = _player;
            }
            else
            {
                // Choose some random DPS to become the new tank.
                _tank = _raid.getRandomMembers(1, false /* allowPlayer */)[0];
            }

            _this.targets.push(_tank);
        }
    };

    function _attackTank()
    {
        _targetTank();

        var attackTankAmount = Random.fromIntegerIntervalInclusive(20, 25);
        if (_isEnraged)
        {
            attackTankAmount *= 2;
        }

        _tank.harm(attackTankAmount);
    }

    function _throwFood()
    {
        _getAttackTankLoop().pause();

        var throwFoodTargets = _raid.getRandomMembers(2, true /* allowPlayer */);
        _this.targets(throwFoodTargets);

        var throwFood = new Actions["Throw Food"](
            throwFoodTargets,
            function ()
            {
                _this.finishCast(throwFood);
                _targetTank();
                _getAttackTankLoop().resume();
            }
        );

        _this.cast(throwFood);
    }

    function _enrage()
    {
        var enrage = new Actions["Enrage"](
            null, // No specific target
            function ()
            {
                _isEnraged = true;

                _this.finishCast(enrage);
                _targetTank();
            });

        _this.cast(enrage);
    }

    function _targetTank()
    {
        _this.targets([_tank]);
    }

    function _getAttackTankLoop()
    {
        return _this.getLoop("Attack Tank");
    }
}

module.exports = GordoRamzee;