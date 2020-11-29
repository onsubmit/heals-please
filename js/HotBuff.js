var Loop = require("./Loop");

function HotBuff(params)
{
    params = params || {};

    var _this = this;

    var _name = params.name || "Missing name";
    var _description = params.description || "Missing description";
    var _interval = params.interval || 2000;
    var _duration = params.duration || 10000;
    var _effect = params.effect;
    var _icon = params.icon;

    var _loop = null;
    var _target = null;
    var _tickCount = 0;
    var _numTicks = Math.floor(_duration / _interval);

    _this.name = _name;
    _this.description = _description;
    _this.icon = _icon;

    _this.tooltip = _name + " -> " + _description;

    _this.start = function (target)
    {
        _target = target;

        _loop = new Loop("Hot Buff", _tick, _interval);
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

        if (++_tickCount === _numTicks)
        {
            _loop.stop();
            _target.removeBuff(_this.name);
        }
    }
}

module.exports = HotBuff;