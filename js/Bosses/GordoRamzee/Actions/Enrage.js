var AnimationHelpers = require("js/AnimationHelpers");

Enrage.id = Enrage.prototype.name = "Enrage";

function Enrage(targets, onSuccess)
{
    var _this = this;

    _this.animation =
        [
            {
                properties: AnimationHelpers.fullWidth,
                options:
                    {
                        duration: 5000,
                        begin: AnimationHelpers.removeStyleAttribute,
                        complete: _complete
                    }
            }
        ];

    function _complete()
    {
        onSuccess();
    }
}

module.exports = Enrage;