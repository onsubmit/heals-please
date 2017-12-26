var AnimationHelpers = require("js/AnimationHelpers");
var DotDebuff = require("js/DotDebuff");
var Random = require("js/Random");

ThrowFood.id = ThrowFood.prototype.name = "Throw Food";

function ThrowFood(targets, onSuccess)
{
    var _this = this;

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
        targets.forEach(
            function (target)
            {
                var harmAmount = Random.fromIntegerIntervalInclusive(12, 18);
                target.harm(harmAmount);

                if (Math.random() < 0.5)
                {
                    var foodPoisoningDebuff = new DotDebuff({
                        name: "Food Poisoning",
                        description: "The food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.",
                        icon: require("images/food-poisoning.png"),
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
    }

    function _complete()
    {
        _cast();
        onSuccess();
    }
}

module.exports = ThrowFood;