var ko = require("knockout");

var RequireHelper = require("./RequireHelper");
var Friendly = require("./Friendly");
var Player = require("./Player");
var Party = require("./Party");
var Random = require("js/Random");
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
    var _rewards = null;

    _this.showIntro = ko.observable(true);
    _this.isPaused = ko.observable(false);
    _this.inCombat = ko.observable(false);
    _this.boss = ko.observable(null);

    _this.allowPause = false;
    _this.friendlies = null;
    _this.player = null;

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
            if (!currentCast.isInstant && currentCast.castProgress > 0.5)
            {
                // If an action is cast while already casting, queue up the action.
                // It will cast immediately after the current cast completes.
                _queuedAction = action;
            }

            return;
        }

        return _castAction(action);
    };

    _this.cancelCast = function ()
    {
        var currentCast = _this.currentCast.value();
        if (currentCast && !currentCast.isInstant)
        {
            currentCast.cancel();
        }
    };

    _this.engageBoss = function ()
    {
        var tank = _this.friendlies.members[0];
        _this.boss().engage(_this.player, tank, _this.friendlies, _onBossKill);
        _this.friendlies.start();
        _this.inCombat(true);
    };

    _this.showBuff = function (buff, member)
    {
        _this.player.setTarget(member);
    };

    _this.showDebuff = function (debuff, member)
    {
        _this.player.setTarget(member);
    };

    _this.pause = function ()
    {
        _this.isPaused(true);

        _this.boss().pause();
        _this.friendlies.pause();
        AnimationHelpers.pause();
    };

    _this.resume = function ()
    {
        _this.isPaused(false);

        _this.boss().resume();
        _this.friendlies.resume();
        AnimationHelpers.resume();
    };

    _this.joinGroupButton_onClick = function ()
    {
        _this.showIntro(false);
    };

    function _castAction(action)
    {
        if (action.isInstant)
        {
            _this.player.spendMana(action.manaCost);
        }

        _this.currentCast.action("finish");
        _this.currentCast.value(action);
    }

    function _finishCast(action, outcome)
    {
        if (!outcome.manaSpent && !outcome.targetDied)
        {
            _this.player.spendMana(action.manaCost);
        }

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
        _queuedAction = null;
        _this.currentCast.action("stop");
        _this.currentCast.value(null);
    }

    function _onFriendlyAttack(damageModifier)
    {
        return (function (innerDamageModifier)
        {
            return function ()
            {
                var isCrit = Math.random() < 0.2;
                var attackAmount = innerDamageModifier * Random.fromIntegerIntervalInclusive(50, 80);

                if (isCrit)
                {
                    attackAmount = Math.round(attackAmount * 2);
                }

                _this.boss().harm(attackAmount);
            };
        })(damageModifier || 1);
    }

    function _onFriendlyDeath(friendly)
    {
        friendly.stop();

        if (_this.player.target() === friendly)
        {
            _this.player.setTarget(null);
        }

        _this.boss().onDeathOfFriendly(friendly);

        if (_this.friendlies.isWiped())
        {
            setTimeout(
                function ()
                {
                    _this.friendlies.stop();
                    _this.boss().stop();
                    _this.pause();

                    alert("You lose!");

                    _this.inCombat(false);
                    _this.friendlies.reset();
                    _this.player.restoreManaToMax();

                    _this.boss(new Bosses[_this.boss().name]);
                }, 0);

            return;
        }
    }

    function _onBossKill()
    {
        var bossName = _this.boss().name;
        var reward = _rewards[bossName];

        var promptFunction = function (message)
        {
            setTimeout(
                function ()
                {
                    _this.friendlies.stop();

                    alert(message);

                    _this.inCombat(false);
                    _this.friendlies.reset();
                    _this.player.restoreManaToMax();
                }, 0);
        };

        if (reward)
        {
            promptFunction("Good job. You've unlocked the '" + reward.heal + "' spell. It may come in handy against " + reward.boss + ".");

            _this.player.actions.push(reward.heal);
            _this.boss(new Bosses[reward.boss]);
        }
        else
        {
            promptFunction("You win!");
        }
    }

    function _document_onKeyPress(e)
    {
        var keyCode = e.which || event.keyCode;

        if (keyCode === 27) // ESC
        {
            _this.cancelCast();
        }
        if (keyCode === 32) // SPACE
        {
            var previousCast = _this.currentCast.previous();
            if (previousCast && previousCast.name)
            {
                _this.cast(previousCast.name);
            }
        }
        else if (keyCode >= 48 && keyCode <= 57) // 0-9
        {
            var actionIndex = keyCode - 49; // - '0' - 1
            var actionName = _this.player.getActionNameByIndex(actionIndex);
            if (actionName)
            {
                _this.cast(actionName);
            }
        }
        else
        {
            var partyIndex = -1;
            switch (keyCode)
            {
                case 81: // q
                    partyIndex = 0;
                    break;
                case 87: // w
                    partyIndex = 1;
                    break;
                case 69: // e
                    partyIndex = 2;
                    break;
                case 82: // r
                    partyIndex = 3;
                    break;
                case 84: // t
                    partyIndex = 4;
                    break;
            }

            var member = _this.friendlies.getMemberByIndex(partyIndex);
            if (member)
            {
                _this.player.setTarget(member);
            }
        }
    }

    (function _initialize()
    {
        _rewards =
            {
                "Gordo Ramzee":
                    {
                        heal: "Renew",
                        boss: "Donny Frump"
                    }
            };

        _this.player = new Player(
            {
                actions: c_defaultHeals,
                attackInterval: 30000,
                onAttack: _onFriendlyAttack(2),
                onDeath: _onFriendlyDeath
            });

        _this.friendlies = new Party(
            [
                new Friendly("Tank",
                    {
                        health: 200,
                        attackInterval: 400,
                        onAttack: _onFriendlyAttack(1),
                        onDeath: _onFriendlyDeath
                    }),
                new Friendly("DPS #1",
                    {
                        attackInterval: 1000,
                        initialAttackDelay: 4000,
                        onAttack: _onFriendlyAttack(3.2),
                        onDeath: _onFriendlyDeath
                    }),
                new Friendly("DPS #2",
                    {
                        attackInterval: 1200,
                        initialAttackDelay: 3500,
                        onAttack: _onFriendlyAttack(3.0),
                        onDeath: _onFriendlyDeath
                    }),
                new Friendly("DPS #3",
                    {
                        attackInterval: 1400,
                        initialAttackDelay: 3000,
                        onAttack: _onFriendlyAttack(2.8),
                        onDeath: _onFriendlyDeath
                    }),
                _this.player
            ]);

        _this.boss(new Bosses["Gordo Ramzee"]);

        ko.utils.registerEventHandler(document, "keydown", _document_onKeyPress);
    })();
};