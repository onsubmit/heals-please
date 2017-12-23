var AnimationHelpers = require("./AnimationHelpers.js");

function SmallHeal(target, onSuccess, onCancel)
{
    var _this = this;

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
        return target.heal(20);
    };

    _this.cancel = function ()
    {
        onCancel();
    };

    function _updateProgress(progress)
    {
        _this.castProgress = progress.complete;
    }

    function _complete()
    {
        _this.cast();
        onSuccess();
    }
}

var Heals = {};
Heals["Small Heal"] = SmallHeal;

module.exports = Heals;