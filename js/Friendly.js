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

    _this.critChance = ko.pureComputed(
        function ()
        {
            return 0.1;
        });

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

    _this.manaPercentageString = ko.pureComputed(
        function ()
        {
            return (100.0 * _this.mana() / _this.maxMana()) + "%";
        });

    _this.manaStatusString = ko.pureComputed(
        function ()
        {
            return _this.mana() + " / " + _this.maxMana();
        });

    _this.heal = function (amount)
    {
        return _adjustHealth(amount);
    };

    _this.harm = function (amount)
    {
        return _adjustHealth(0 - amount);
    };

    _this.spendMana = function (amount)
    {
        _adjustMana(0 - amount);
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

    _this.setTarget = function (target)
    {
        _this.target(target);
    };

    _this.isDead = function ()
    {
        return _this.health.peek() === 0;
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

    function _adjustMana(amount)
    {
        var currentMana = _this.mana();
        var newMana = currentMana + amount;

        if (newMana >= _this.maxMana())
        {
            _this.mana(_this.maxMana());
        }
        else if (newMana <= 0)
        {
            _this.mana(0);
        }
        else
        {
            _this.mana(newMana);
        }
    }

    (function _initialize()
    {
    })();
}

module.exports = Friendly;