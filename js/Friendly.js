var ko = require("knockout");
var Loop = require("js/Loop");
var Loops = require("js/Loops");
var AnimationHelpers = require("./AnimationHelpers");
var DebuffType = require("./DebuffType");

function Friendly(name, params)
{
    params = params || {};

    var _this = this;

    var _loops = null;

    var _health = params.health || 100;
    var _maxHealth = params.maxHealth || _health;
    var _initialAttackDelay = params.initialAttackDelay || 0;
    var _attackInterval = params.attackInterval || 1000;
    var _onAttackCallback = params.onAttack;
    var _onDeathCallback = params.onDeath;

    _this.name = name;
    _this.maxHealth = _maxHealth;

    _this.health = ko.observable(_health);
    _this.isDead = ko.observable(false);
    _this.buffs = ko.observableArray([]);
    _this.debuffs = ko.observableArray([]);
    _this.lastHealInfo = ko.observable();

    _this.healthPercentage = ko.pureComputed(
        function ()
        {
            return _this.health() / _this.maxHealth;
        });

    _this.healthPercentageString = ko.pureComputed(
        function ()
        {
            return (100.0 * _this.healthPercentage()) + "%";
        });

    _this.healthStatusString = ko.pureComputed(
        function ()
        {
            return _this.health() + "/" + _this.maxHealth;
        });

    _this.lastHealStatusString = ko.pureComputed(
        function ()
        {
            var lastHealInfo = _this.lastHealInfo();
            if (lastHealInfo && !lastHealInfo.targetDied)
            {
                return lastHealInfo ? ("+" + lastHealInfo.effectiveAmount) : "";
            }
        });

    _this.animations =
    {
        fastFadeOut:
            {
                animation:
                    {
                        properties: "fadeOut",
                        options:
                            {
                                duration: 1000,
                                begin: AnimationHelpers.removeStyleAttribute
                            }
                    }
            }
    };

    _this.heal = function (healParams)
    {
        var healInfo = null;

        if (_this.isDead())
        {
            healInfo = { targetDied: true };
        }
        else
        {
            var overheal = _adjustHealth(healParams.amount);

            healInfo =
            {
                amount: healParams.amount,
                effectiveAmount: healParams.amount - overheal,
                overheal: overheal,
                isCrit: healParams.isCrit
            };
        }

        _this.lastHealInfo(healInfo);

        return healInfo;
    };

    _this.healToMax = function (allowResurrection)
    {
        if (_this.isDead() && allowResurrection)
        {
            _this.resurrect(_maxHealth);
        }
        else
        {
            _this.health(_maxHealth);
        }
    };

    _this.resurrect = function (health)
    {
        if (_this.isDead())
        {
            _this.isDead(false);
            _this.health(health || Math.round(_maxHealth * 0.2));
        }
    };

    _this.harm = function (amount)
    {
        _getDebuffsByType(DebuffType.IncreaseDamageTaken)
            .forEach(
                function (debuff)
                {
                    amount = debuff.effect(amount);
                });

        return _adjustHealth(0 - amount);
    };

    _this.applyBuff = function (buff)
    {
        // Remove any pre-existing buffs by this name.
        _this.removeBuff(buff.name);

        buff.start(_this);
        _this.buffs.push(buff);
    };

    _this.removeBuff = function (buffNameToRemove)
    {
        var removedBuffs = _this.buffs.remove(
            function (buff)
            {
                return buff.name === buffNameToRemove;
            });

        if (removedBuffs.length)
        {
            removedBuffs.forEach(
                function (removedBuff)
                {
                    removedBuff.stop();
                }
            );

            return true;
        }

        return false;
    };

    _this.applyDebuff = function (debuff)
    {
        debuff.start(_this);
        _this.debuffs.push(debuff);
    };

    _this.removeDebuff = function (debuffNameToRemove)
    {
        var removedDebuffs = _this.debuffs.remove(
            function (debuff)
            {
                return debuff.name === debuffNameToRemove;
            });

        if (removedDebuffs.length)
        {
            removedDebuffs.forEach(
                function (removedDebuff)
                {
                    removedDebuff.stop();
                }
            );

            return true;
        }

        return false;
    };

    _this.removeLastDebuff = function ()
    {
        _this.debuffs.pop().stop();
    };

    _this.start = function ()
    {
        _loops.start();
    };

    _this.stop = function ()
    {
        _loops.stop();
        _doBuffAction("stop");
        _doDebuffAction("stop");
    };

    _this.pause = function ()
    {
        _loops.pause();
        _doBuffAction("pause");
        _doDebuffAction("pause");
    };

    _this.resume = function ()
    {
        _loops.resume();
        _doBuffAction("resume");
        _doDebuffAction("resume");
    };

    _this.reset = function ()
    {
        _this.healToMax(true);
        _this.buffs.removeAll();
        _this.debuffs.removeAll();
    };

    function _doBuffAction(actionName)
    {
        _this.buffs().forEach(
            function (buff)
            {
                buff[actionName]();
            });
    }

    function _doDebuffAction(actionName)
    {
        _this.debuffs().forEach(
            function (debuff)
            {
                debuff[actionName]();
            });
    }

    function _getDebuffsByType(debuffType)
    {
        return ko.utils.arrayFilter(
            _this.debuffs(),
            function (debuff)
            {
                return debuff.type === debuffType;
            });
    }

    function _adjustHealth(amount)
    {
        var currentHealth = _this.health();
        var newHealth = currentHealth + amount;

        if (newHealth >= _this.maxHealth)
        {
            _this.health(_this.maxHealth);
            return newHealth - _this.maxHealth; // overheal
        }

        if (newHealth <= 0)
        {
            _this.health(0);
            return newHealth; // underheal
        }

        _this.health(newHealth);
        return 0;
    }

    function _onDeath()
    {
        _this.stop();
        _this.buffs.removeAll();
        _this.debuffs.removeAll();
        _this.isDead(true);
    }

    (function _initialize()
    {
        var healthSubscription = _this.health.subscribe(
            function (currentHealth)
            {
                if (currentHealth === 0)
                {
                    _onDeath();
                    if (_onDeathCallback)
                    {
                        _onDeathCallback(_this);
                    }

                    healthSubscription.dispose();
                }
            });

        _loops = new Loops(new Loop("Attack", _onAttackCallback, _attackInterval, _initialAttackDelay));
    })();
}

module.exports = Friendly;