var ko = require("knockout");
var AnimationHelpers = require("js/AnimationHelpers");
var PreviousValueTracker = require("js/PreviousValueTracker");

function Boss(encounterLength)
{
    var _this = this;

    var _loops = null;
    var _onDeathCallback = null;

    _this.targets = ko.observableArray([]);
    _this.currentCast = PreviousValueTracker.observable();

    _this.health =
        {
            animation:
            [
                {
                    properties: AnimationHelpers.zeroWidth,
                    options:
                        {
                            duration: encounterLength,
                            begin: AnimationHelpers.removeStyleAttribute,
                            complete: _onDeath
                        }
                }
            ]
        };

    _this.getLoop = function (loopName)
    {
        return _loops.get(loopName);
    };

    _this.initialize = function (loops, onDeathCallback)
    {
        _loops = loops;
        _onDeathCallback = onDeathCallback;
    };

    _this.engage = function ()
    {
        throw new Error("Abstract method");
    };

    _this.start = function ()
    {
        _loops.start();
    };

    _this.pause = function ()
    {
        _loops.pause();
    };

    _this.resume = function ()
    {
        _loops.resume();
    };

    function _onDeath()
    {
        _this.targets.removeAll();

        _loops.stop();

        _onDeathCallback();
    }
}

module.exports = Boss;