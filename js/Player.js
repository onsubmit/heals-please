var ko = require("knockout");
var Friendly = require("./Friendly.js");

function Player(params)
{
    params.onDeath = (function (originalOnDeath)
    {
        return function ()
        {
            _onDeath();
            if (originalOnDeath)
            {
                originalOnDeath(_this);
            }
        };
    })(params.onDeath);

    Friendly.call(this, "Player", params);

    var _this = this;

    var _mana = params.mana || 1000;
    var _maxMana = params.maxMana || _mana;
    var _actions = params.actions || [];

    _this.isPlayer = true;

    _this.mana = ko.observable(_mana);
    _this.maxMana = ko.observable(_maxMana);
    _this.actions = ko.observableArray(_actions);
    _this.target = ko.observable();
    _this.inGlobalCooldown = ko.observable(false);

    _this.critChance = ko.pureComputed(
        function ()
        {
            return 0.1;
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

    _this.spendMana = function (amount)
    {
        _adjustMana(0 - amount);
    };

    _this.setTarget = function (target)
    {
        if (!_this.isDead())
        {
            _this.target(target);
        }
    };

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

    function _onDeath()
    {
        _this.target(null);
    }
}

module.exports = Player;