var AnimationHelpers = require("../../../AnimationHelpers.js");
var DotDebuff = require("../../../DotDebuff.js");
var Random = require("../../../Random.js");

module.exports = function (targets, onSuccess)
{
    var _this = this;

    _this.name = "Throw Food";

    _this.animation =
        [
            {
                properties: AnimationHelpers.fullWidth,
                options:
                    {
                        duration: 2000,
                        begin: AnimationHelpers.removeStyleAttribute,
                        complete: _complete
                    }
            }
        ];

    function _cast()
    {
        ko.utils.arrayForEach(
            targets,
            function (target)
            {
                var harmAmount = Random.fromIntegerIntervalInclusive(12, 18);
                target.harm(harmAmount);

                if (Math.random() < 0.5)
                {
                    var foodPoisoningDebuff = new DotDebuff({
                        name: "Food Poisoning",
                        description: "The food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.",
                        icon: require("../../../../images/food-poisoning.png"),
                        interval: 1000,
                        duration: 5000,
                        effect: function (foodPoisoningTarget)
                            {
                                var foodPoisoningHarmAmount = Random.fromIntegerIntervalInclusive(8, 16);
                                foodPoisoningTarget.harm(foodPoisoningHarmAmount);
                            }
                    });

                    target.applyDebuff(foodPoisoningDebuff);
                }
            });
    };

    function _complete()
    {
        _cast();
        onSuccess();
    }
};