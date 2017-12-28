var ko = require("knockout");
var AnimationHelpers = require("js/AnimationHelpers");
var PreviousValueTracker = require("js/PreviousValueTracker");

function Boss(encounterLength)
{
    var _this = this;

    var _loops = null;
    var _triggers = null;
    var _onDeathCallback = null;

    _this.targets = ko.observableArray([]);
    _this.currentCasts = ko.observableArray([]);

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
                            progress: AnimationHelpers.makeUpdateProgressFunction(_updateProgress),
                            complete: _onDeath
                        }
                }
            ]
        };

    _this.getLoop = function (loopName)
    {
        return _loops.get(loopName);
    };

    _this.initialize = function (params)
    {
        if (!params
            || !params.loops
            || !params.onDeathCallback)
        {
            throw new Error("Missing required parameter");
        }

        if (params.initialTargets)
        {
            _this.targets([].concat(params.initialTargets));
        }

        _loops = params.loops;
        _triggers = params.triggers || [];
        _onDeathCallback = params.onDeathCallback;
    };

    _this.engage = function ()
    {
        throw new Error("Abstract method");
    };

    _this.onDeathOfFriendly = function ()
    {
        throw new Error("Abstract method");
    };

    _this.cast = function (action)
    {
        _this.currentCasts.push(ko.utils.extend(new PreviousValueTracker(action),
            {
                action: ko.observable().extend({ notify: "always" })
            }));
    };

    _this.finishCast = function (action)
    {
        _this.currentCasts.remove(
            function (cast)
            {
                return cast.value() === action;
            });
    };

    _this.start = function ()
    {
        _loops.start();
    };

    _this.stop = function ()
    {
        _this.targets.removeAll();
        _loops.stop();

        _this.currentCasts().forEach(
            function (cast)
            {
                cast.action("finish");
            });
    };

    _this.pause = function ()
    {
        _loops.pause();
    };

    _this.resume = function ()
    {
        _loops.resume();
    };

    function _updateProgress(progress)
    {
        _triggers.forEach(
            function (trigger)
            {
                trigger.execute(progress.complete);
            });
    }

    function _onDeath()
    {
        _this.stop();
        _onDeathCallback();
    }
}

module.exports = Boss;