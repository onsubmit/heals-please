var ko = require("knockout");
var Velocity = require("velocity-animate");

var Friendly = require("./Friendly");
var Party = require("./Party");
var Heals = require("./Heals");
var Bosses = require("./Bosses");

require("../css/app.less");

module.exports = function ()
{
    var _this = this;

    var c_defaultHeals = [Object.keys(Heals)[0]];

    var _queuedAction = null;

    _this.inCombat = ko.observable(false);

    _this.player = new Friendly("Player", { actions: c_defaultHeals });
    _this.friendlies = new Party([ _this.player ]);
    _this.boss = Bosses["Gordo Ramzee"];
    _this.currentCast = ko.utils.extend(ko.observable(),
        {
            action: ko.observable().extend({ notify: "always" })
        });

    _this.fadeOutCastBarAnimation =
        {
            animation:
                {
                    properties: "fadeOut",
                    options: { duration: 200 }
                }
        };

    _this.cast = function (actionName)
    {
        var target = _this.player.target();
        if (!target)
        {
            return;
        }

        var action = new Heals[actionName](target, _finishCast, _cancelCast);

        var currentCast = _this.currentCast();
        if (currentCast)
        {
            if (currentCast.castProgress > 0.5)
            {
                // If an action is cast while already casting, queue up the action.
                // It will cast immediately after the current cast completes.
                _queuedAction = action;
            }

            return;
        }

        return _castAction(action);
    };

    _this.engageBoss = function ()
    {
        var tank = _this.friendlies.members[0];
        _this.boss.engage(_this.player, tank, _this.friendlies, _onBossKill);
        _this.inCombat(true);
    };

    _this.showDebuff = function (/*debuff*/)
    {

    };

    _this.pause = function ()
    {
        var pausedElements = document.getElementsByClassName("velocity-animating");
        Velocity(pausedElements, "pause");

        _this.boss.pause();
        _this.friendlies.pause();

        return pausedElements;
    };

    _this.resume = function ()
    {
        var pausedElements = document.getElementsByClassName("velocity-animating");

        _this.boss.resume();
        _this.friendlies.resume();

        Velocity(pausedElements, "resume");
    };

    function _castAction(action)
    {
        if (action.isInstant)
        {
            action.cast();
            return;
        }

        _this.currentCast.action("finish");
        _this.currentCast(action);
    }

    function _finishCast()
    {
        if (_queuedAction)
        {
            _castAction(_queuedAction);
            _queuedAction = null;
        }
        else
        {
            _this.currentCast(null);
        }
    }

    function _cancelCast()
    {
        _this.currentCast(null);
    }

    function _onBossKill()
    {
        alert("You win!");
    }

    (function _initialize()
    {
    })();
};