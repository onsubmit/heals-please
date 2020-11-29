var AnimationHelpers = require("js/AnimationHelpers");
var Debuff = require("js/Debuff");
var DebuffType = require("js/DebuffType");
var Random = require("js/Random");

AngryTweet.id = AngryTweet.prototype.name = "Angry Tweet";

function AngryTweet(targets, onSuccess)
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
                var harmAmount = Random.fromIntegerIntervalInclusive(6, 20);
                target.harm(harmAmount);

                if (!target.isDead() && Math.random() < 0.3)
                {
                    var confusionDebuff = new Debuff({
                        name: "Confusion",
                        description: "Damage taken is doubled for 5 seconds.",
                        type: DebuffType.IncreaseDamageTaken,
                        icon: require("images/confusion.svg"),
                        duration: 5000,
                        effect: function (damage)
                        {
                            // Damage taken is doubled.
                            return damage * 2.0;
                        }
                    });

                    target.applyDebuff(confusionDebuff);
                }
            });
    }

    function _complete()
    {
        _cast();
        onSuccess();
    }
}

module.exports = AngryTweet;