var ko = require("knockout");

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