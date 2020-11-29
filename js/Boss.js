var ko = require("knockout");
var PreviousValueTracker = require("js/PreviousValueTracker");

function Boss(health)
{
    var _this = this;

    var _loops = null;
    var _triggers = null;
    var _onDeathCallback = null;

    _this.maxHealth = health;

    _this.health = ko.observable(health);
    _this.isDead = ko.observable(false);
    _this.targets = ko.observableArray([]);
    _this.currentCasts = ko.observableArray([]);

    _this.healthPercentageString = ko.pureComputed(
        function ()
        {
            return (100.0 * _this.health() / _this.maxHealth) + "%";
        });

    _this.harm = function (amount)
    {
        return _adjustHealth(0 - amount);
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

        if (params.initialEvents)
        {
            params.initialEvents.forEach(
                function (initialEvent)
                {
                    initialEvent();
                }
            );
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

    function _adjustHealth(amount)
    {
        var newHealth = _this.health() + amount;

        if (newHealth <= 0)
        {
            _this.health(0);
            _updateProgress(0);
            _onDeath();
        }
        else if (newHealth <= _this.maxHealth)
        {
            _this.health(newHealth);
            _updateProgress(100.0 * newHealth / _this.maxHealth);
        }
        else
        {
            _this.health(_this.maxHealth);
            _updateProgress(100);
        }
    }

    function _updateProgress(healthPercentage)
    {
        _triggers.forEach(
            function (trigger)
            {
                trigger.execute(healthPercentage);
            });
    }

    function _onDeath()
    {
        _this.stop();
        _this.isDead(true);
        _onDeathCallback();
    }
}

module.exports = Boss;