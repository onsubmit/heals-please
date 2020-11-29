var AnimationHelpers = require("js/AnimationHelpers");
var DotDebuff = require("js/DotDebuff");

Uncertainty.id = Uncertainty.prototype.name = "Uncertainty";

function Uncertainty(targets, onSuccess)
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
                var uncertaintyDebuff = new DotDebuff({
                    name: "Uncertainty",
                    description: "Target can't tell what's true anymore. At full health, target takes 1 damage every 2 seconds. Increases to 5 per 2 seconds when near death.",
                    icon: require("images/uncertainty.svg"),
                    interval: 2000,
                    duration: -1,
                    effect: function (uncertaintyTarget)
                    {
                        // 1 dps @ 100% health
                        // 5 dps @ 0% health
                        var harmAmount = Math.round(-4 * uncertaintyTarget.healthPercentage() + 5);
                        uncertaintyTarget.harm(harmAmount);
                    }
                });

                target.applyDebuff(uncertaintyDebuff);
            });
    }

    function _complete()
    {
        _cast();
        onSuccess();
    }
}

module.exports = Uncertainty;