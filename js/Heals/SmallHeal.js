var AnimationHelpers = require("js/AnimationHelpers");
var Random = require("js/Random");

SmallHeal.id = SmallHeal.prototype.name = "Small Heal";
SmallHeal.prototype.manaCost = 40;

function SmallHeal(target, params)
{
    params = params || {};

    var _this = this;

    var _critChance = params.critChance || 0.1;
    var _critMultiplier = params.critMultiplier || 1.5;
    var _onFinish = params.onFinish;
    var _onCancel = params.onCancel;

    _this.castProgress = 0.0;

    _this.animation =
        [
            {
                properties: AnimationHelpers.fullWidth,
                options:
                    {
                        duration: 1000,
                        begin: AnimationHelpers.removeStyleAttribute,
                        progress: AnimationHelpers.makeUpdateProgressFunction(_updateProgress),
                        complete: _complete
                    }
            }
        ];

    _this.cast = function ()
    {
        var isCrit = Math.random() < _critChance;
        var healAmount = Random.fromIntegerIntervalInclusive(18, 24);

        if (isCrit)
        {
            healAmount = Math.round(healAmount * _critMultiplier);
        }

        return target.heal({ amount: healAmount, isCrit: isCrit });
    };

    _this.cancel = function ()
    {
        var outcome = { wasCancelled: true };
        _onCancel(_this, outcome);
    };

    function _updateProgress(progress)
    {
        _this.castProgress = progress.complete;
    }

    function _complete()
    {
        var outcome = _this.cast();
        _onFinish(_this, outcome);
    }
}

module.exports = SmallHeal;