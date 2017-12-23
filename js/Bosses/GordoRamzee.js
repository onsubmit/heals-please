var ko = require("knockout");
var Random = require("../Random.js");
var AnimationHelpers = require("../AnimationHelpers.js");
var DotDebuff = require("../DotDebuff.js");

module.exports = new function()
{
    var _this = this;

    var _onDeathCallback = null;

    _this.name = "Gordo Ramzee";
    _this.timeouts = {};
    _this.targets = ko.observableArray([]);

    _this.health = ko.utils.extend(ko.observable(1000),
        {
            animation:
            [
                {
                    properties: AnimationHelpers.zeroWidth,
                    options:
                        {
                            duration: 30000,
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

        _this.targets.push(tank);

        (function tankAttackLoop()
        {
            var attackTankWait = 1000 * Random.fromFloatInterval(2, 4);
            _this.timeouts.attackTank = setTimeout(
                function ()
                {
                    _this.targets([tank]);
                    var attackTankAmount = Random.fromIntegerIntervalInclusive(20, 25);
                    tank.harm(attackTankAmount);
                    tankAttackLoop();
                },
                attackTankWait);
        })();

        (function throwFoodLoop()
        {
            var throwFoodWait = 10000;
            _this.timeouts.throwFood = setTimeout(
                function ()
                {
                    // TODO: Give this a 1-second cast time. Focus will be taken off the tank during that time.
                    var throwFoodTargets = raid.getRandomMembers(2);
                    _this.targets(throwFoodTargets);

                    ko.utils.arrayForEach(
                        throwFoodTargets,
                        function (throwFoodTarget)
                        {
                            var throwFoodHarmAmount = Random.fromIntegerIntervalInclusive(12, 18);
                            throwFoodTarget.harm(throwFoodHarmAmount);

                            if (Math.random() < 0.5)
                            {
                                var foodPoisoningDebuff = new DotDebuff({
                                    name: "Food Poisoning",
                                    description: "The food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.",
                                    icon: require("../../images/food-poisoning.png"),
                                    interval: 1000,
                                    duration: 5000,
                                    effect: function (foodPoisoningTarget)
                                        {
                                            var foodPoisoningHarmAmount = Random.fromIntegerIntervalInclusive(8, 16);
                                            foodPoisoningTarget.harm(foodPoisoningHarmAmount);
                                        }
                                });

                                throwFoodTarget.applyDebuff(foodPoisoningDebuff);
                            }
                        });

                    throwFoodLoop();
                },
                throwFoodWait);
        })();
    };

    _this.giveFoodPoisoning = function (target)
    {

    };

    function _onDeath()
    {
        _this.targets.removeAll();

        ko.utils.objectForEach(
            _this.timeouts,
            function (key, timeout)
            {
                clearTimeout(timeout);
            });

        _onDeathCallback();
    }
}