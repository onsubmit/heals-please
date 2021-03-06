var Loop = require("./Loop");
var DebuffType = require("./DebuffType");

function DotDebuff(params)
{
    params = params || {};

    var _this = this;

    var _name = params.name || "Missing name";
    var _description = params.description || "Missing description";
    var _interval = params.interval || 1000;
    var _duration = params.duration || 5000;
    var _effect = params.effect;
    var _icon = params.icon;

    var _loop = null;
    var _target = null;
    var _tickCount = 0;
    var _numTicks = _duration > 0 ? Math.floor(_duration / _interval) : -1;

    _this.name = _name;
    _this.description = _description;
    _this.icon = _icon;
    _this.type = DebuffType.DamageOverTime;

    _this.tooltip = _name + " -> " + _description;

    _this.start = function (target)
    {
        _target = target;

        _loop = new Loop("Dot Debuff", _tick, _interval);
        _loop.start();
    };

    _this.stop = function ()
    {
        _loop.stop();
    };

    _this.resume = function ()
    {
        _loop.resume();
    };

    _this.pause = function ()
    {
        _loop.pause();
    };

    function _tick()
    {
        _effect(_target);

        if (_duration > 0 && ++_tickCount === _numTicks)
        {
            _loop.stop();
            _target.removeDebuff(_this.name);
        }
    }
}

module.exports = DotDebuff;