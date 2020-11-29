var AnimationHelpers = require("js/AnimationHelpers");
var HotBuff = require("js/HotBuff");

Renew.id = Renew.prototype.name = "Renew";
Renew.prototype.manaCost = 80;

function Renew(target, params)
{
    params = params || {};

    var _this = this;

    var _critChance = params.critChance || 0.1;
    var _critMultiplier = params.critMultiplier || 1.5;
    var _onFinish = params.onFinish;

    _this.castProgress = 0.0;
    _this.isInstant = true;

    _this.animation =
        [
            {
                properties: AnimationHelpers.fullWidth,
                options:
                    {
                        duration: 250,
                        begin: _begin,
                        progress: AnimationHelpers.makeUpdateProgressFunction(_updateProgress),
                        complete: _complete
                    }
            }
        ];

    _this.cast = function ()
    {
        var renewBuff = new HotBuff({
            name: "Renew",
            description: "The target feels renewed, gaining health over time.",
            icon: require("images/renew.svg"),
            effect: function (renewTarget)
            {
                var isCrit = Math.random() < _critChance;
                var healAmount = 8;

                if (isCrit)
                {
                    healAmount = Math.round(healAmount * _critMultiplier);
                }

                renewTarget.heal({ amount: healAmount, isCrit: isCrit });
            }
        });

        target.applyBuff(renewBuff);
    };

    function _begin(elements)
    {
        AnimationHelpers.removeStyleAttribute(elements);
        _this.cast();
    }

    function _updateProgress(progress)
    {
        _this.castProgress = progress.complete;
    }

    function _complete()
    {
        var outcome = { manaSpent: true };
        _onFinish(_this, outcome);
    }
}

module.exports = Renew;