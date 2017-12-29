var ko = require("knockout");
var AnimationHelpers = require("./AnimationHelpers");

function Friendly(name, params)
{
    params = params || {};

    var _this = this;

    var _health = params.health || 100;
    var _maxHealth = params.maxHealth || _health;
    var _onDeathCallback = params.onDeath;

    _this.name = name;

    _this.health = ko.observable(_health);
    _this.maxHealth = ko.observable(_maxHealth);
    _this.isDead = ko.observable(false);
    _this.debuffs = ko.observableArray([]);
    _this.lastHealInfo = ko.observable();

    _this.healthPercentageString = ko.pureComputed(
        function ()
        {
            return (100.0 * _this.health() / _this.maxHealth()) + "%";
        });

    _this.healthStatusString = ko.pureComputed(
        function ()
        {
            return _this.health() + "/" + _this.maxHealth();
        });

    _this.lastHealStatusString = ko.pureComputed(
        function ()
        {
            var lastHealInfo = _this.lastHealInfo();
            return lastHealInfo ? ("+" + lastHealInfo.effectiveAmount) : "";
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
        if (_this.isDead())
        {
            return;
        }

        var overheal = _adjustHealth(healParams.amount);

        var healInfo =
        {
            amount: healParams.amount,
            effectiveAmount: healParams.amount - overheal,
            overheal: overheal,
            isCrit: healParams.isCrit
        };

        _this.lastHealInfo(healInfo);
    };

    _this.harm = function (amount)
    {
        return _adjustHealth(0 - amount);
    };

    _this.applyDebuff = function (debuff)
    {
        debuff.start(_this);
        _this.debuffs.push(debuff);
    };

    _this.removeDebuff = function (debuffToRemove)
    {
        _this.debuffs.remove(debuffToRemove);
        debuffToRemove.stop();
    };

    _this.removeLastDebuff = function ()
    {
        _this.debuffs.pop().stop();
    };

    _this.pause = function ()
    {
        _doDebuffAction("pause");
    };

    _this.stop = function ()
    {
        _doDebuffAction("stop");
    };

    _this.resume = function ()
    {
        _doDebuffAction("resume");
    };

    function _doDebuffAction(actionName)
    {
        _this.debuffs().forEach(
            function (debuff)
            {
                debuff[actionName]();
            });
    }

    function _adjustHealth(amount)
    {
        var currentHealth = _this.health();
        var newHealth = currentHealth + amount;

        if (newHealth >= _this.maxHealth())
        {
            _this.health(_this.maxHealth());
            return newHealth - _this.maxHealth(); // overheal
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
        _this.isDead(true);
        _this.debuffs.removeAll();
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
    })();
}

module.exports = Friendly;