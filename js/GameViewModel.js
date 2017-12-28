var ko = require("knockout");

var RequireHelper = require("./RequireHelper");
var Friendly = require("./Friendly");
var Player = require("./Player");
var Party = require("./Party");
var Heals = RequireHelper.requireAll(require.context("./Heals/", false, /\.js$/));
var Bosses = RequireHelper.requireAll(require.context("./Bosses/", false, /\.js$/));
var AnimationHelpers = require("./AnimationHelpers");
var PreviousValueTracker = require("./PreviousValueTracker");

require("../css/app.less");

module.exports = function ()
{
    var _this = this;

    var c_defaultHeals = ["Small Heal"];

    var _queuedAction = null;

    _this.isPaused = ko.observable(false);
    _this.inCombat = ko.observable(false);

    _this.allowPause = false;
    _this.friendlies = null;
    _this.player = null;
    _this.boss = null;

    _this.currentCast = ko.utils.extend(new PreviousValueTracker(),
        {
            action: ko.observable().extend({ notify: "always" })
        });

    _this.animations =
        {
            fadeOutCastBar:
                {
                    animation:
                        {
                            properties: "fadeOut",
                            options:
                                {
                                    duration: 200,
                                    complete: AnimationHelpers.removeStyleAttribute
                                }
                        }
                }
        };

    _this.cast = function (actionName)
    {
        if (_this.isPaused())
        {
            return;
        }

        var target = _this.player.target();
        if (!target)
        {
            return;
        }

        var healParams =
            {
                critChance: _this.player.critChance(),
                onFinish: _finishCast,
                onCancel: _cancelCast
            };

        var action = new Heals[actionName](target, healParams);

        if (_this.player.mana() < action.manaCost)
        {
            // Out of mana
            return;
        }

        var currentCast = _this.currentCast.value();
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
        _this.isPaused(true);

        _this.boss.pause();
        _this.friendlies.pause();
        AnimationHelpers.pause();
    };

    _this.resume = function ()
    {
        _this.isPaused(false);

        _this.boss.resume();
        _this.friendlies.resume();
        AnimationHelpers.resume();
    };

    function _castAction(action)
    {
        if (action.isInstant)
        {
            _this.player.spendMana(action.manaCost);
            action.cast();
            return;
        }

        _this.currentCast.action("finish");
        _this.currentCast.value(action);
    }

    function _finishCast(action)
    {
        _this.player.spendMana(action.manaCost);

        if (_queuedAction)
        {
            _castAction(_queuedAction);
            _queuedAction = null;
        }
        else
        {
            _this.currentCast.value(null);
        }
    }

    function _cancelCast()
    {
        _this.currentCast.value(null);
    }

    function _onFriendlyDeath(friendly)
    {
        if (_this.player.target() === friendly)
        {
            _this.player.setTarget(null);
        }

        _this.boss.onDeathOfFriendly(friendly);

        if (_this.friendlies.isWiped())
        {
            setTimeout(
                function ()
                {
                    alert("You lose!");
                    _this.pause();
                }, 0);

            return;
        }
    }

    function _onBossKill()
    {
        setTimeout(
            function ()
            {
                alert("You win!");
            }, 0);
    }

    (function _initialize()
    {
        _this.player = new Player({ actions: c_defaultHeals, onDeath: _onFriendlyDeath });
        _this.friendlies = new Party(
            [
                new Friendly("Tank", { health: 200, onDeath: _onFriendlyDeath }),
                new Friendly("DPS #1", { onDeath: _onFriendlyDeath }),
                new Friendly("DPS #2", { onDeath: _onFriendlyDeath }),
                new Friendly("DPS #3", { onDeath: _onFriendlyDeath }),
                _this.player
            ]);

        _this.boss = new Bosses["Gordo Ramzee"];
    })();
};