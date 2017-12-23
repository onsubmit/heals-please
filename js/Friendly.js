var ko = require("knockout");

function Friendly(name, params)
{
    params = params || {};

    var _this = this;

    var _health = params.health || 100;
    var _maxHealth = params.maxHealth || _health;
    var _mana = params.mana || 1000;
    var _maxMana = params.maxMana || _mana;
    var _actions = params.actions || [];

    _this.name = name;

    _this.health = ko.observable(_health);
    _this.maxHealth = ko.observable(_maxHealth);
    _this.mana = ko.observable(_mana);
    _this.maxMana = ko.observable(_maxMana);
    _this.actions = ko.observableArray(_actions);
    _this.target = ko.observable();
    _this.debuffs = ko.observableArray([]);
    _this.inGlobalCooldown = ko.observable(false);

    _this.healthPercentageString = ko.pureComputed(
        function ()
        {
            return (100.0 * _this.health() / _this.maxHealth()) + "%";
        });

    _this.healthStatusString = ko.pureComputed(
        function ()
        {
            return _this.health() + " / " + _this.maxHealth();
        });

    _this.heal = function (amount)
    {
        return _adjustHealth(amount);
    };

    _this.harm = function (amount)
    {
        return _adjustHealth(0 - amount);
    };

    _this.applyDebuff = function (debuff)
    {
        var debuffTickTimeout = debuff.start(_this);

        var debuffAndTickTimeout = { timeout: debuffTickTimeout, debuff: debuff };
        _this.debuffs.push(debuffAndTickTimeout);
    };

    _this.removeDebuff = function (debuffToRemove)
    {
        var removedDebuffs = _this.debuffs.remove(
            function (debuffAndTickTimeout)
            {
                return debuffAndTickTimeout.debuff === debuffToRemove;
            });

        ko.utils.arrayForEach(
            removedDebuffs,
            function (debuffAndTickTimeout)
            {
                if (debuffAndTickTimeout.timeout)
                {
                    clearTimeout(debuffAndTickTimeout.timeout);
                }
            });
    };

    _this.removeLastDebuff = function ()
    {
        var debuffAndTickTimeout = _this.debuffs.pop();
        clearTimeout(debuffAndTickTimeout.timeout);
    };

    _this.setTarget = function (target)
    {
        _this.target(target);
    };

    _this.isDead = function ()
    {
        return _this.health.peek() === 0;
    };

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

    (function _initialize()
    {
    })();
}

module.exports = Friendly;