var RequireHelper = require("js/RequireHelper");
var Boss = require("js/Boss");
var Random = require("js/Random");
var Loop = require("js/Loop");
var Loops = require("js/Loops");
var Trigger = require("js/Trigger");
var Actions = RequireHelper.requireAll(require.context("./DonnyFrump/Actions/", false, /\.js$/));

DonnyFrump.id = DonnyFrump.prototype.name = "Donny Frump";

function DonnyFrump()
{
    Boss.call(this, 80000);

    var _this = this;

    var _player = null;
    var _tank = null;
    var _raid = null;
    var _isEnraged = false;

    _this.engage = function (player, tank, raid, onDeathCallback)
    {
        // The encounter begins and Donny Frump is not pleased people on Twitter are being mean to him.
        // He casts Uncertainty on the entire raid, a debuff that does damage over time and
        // does more damage as a party member's health decreases.
        // He targets the tank and does 15-20 damage every 2-4 seconds.
        // Every 10 seconds he sends an angry tweet, hitting 1-3 members of the party, damaging each between 6-20.
        // There's a 30% chance the tweet contains egregious misinformation, confusing affected party members further,
        // doubling their damage taken for 5 seconds.
        // At 20% health, he enrages, soiling his diaper, and all damage done to the tank is doubled.

        _player = player;
        _tank = tank;
        _raid = raid;

        var loops = new Loops(
            new Loop("Attack Tank", _attackTank, function () { return 1000 * Random.fromIntegerIntervalInclusive(2, 4); }),
            new Loop("Angry Tweet", _angryTweet, 10000));

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
                initialEvents: [ _castUncertainty ],
                loops: loops,
                triggers: triggers,
                onDeathCallback: onDeathCallback
            };

        _this.initialize(bossParams);
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

        var attackTankAmount = Random.fromIntegerIntervalInclusive(15, 20);
        if (_isEnraged)
        {
            attackTankAmount *= 2;
        }

        _tank.harm(attackTankAmount);
    }

    function _castUncertainty()
    {
        _this.targets(_raid.members);

        var uncertainty = new Actions["Uncertainty"](
            _raid.members,
            function ()
            {
                _this.finishCast(uncertainty);
                _targetTank();
                _this.start();
            }
        );

        _this.cast(uncertainty);
    }

    function _angryTweet()
    {
        _getAttackTankLoop().pause();

        var numTargets = Random.fromIntegerIntervalInclusive(1, 3);
        var angryTweetTargets = _raid.getRandomMembers(numTargets, true /* allowPlayer */);
        _this.targets(angryTweetTargets);

        var angryTweet = new Actions["Angry Tweet"](
            angryTweetTargets,
            function ()
            {
                _this.finishCast(angryTweet);
                _targetTank();
                _getAttackTankLoop().resume();
            }
        );

        _this.cast(angryTweet);
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

module.exports = DonnyFrump;