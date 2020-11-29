var Loop = require("./Loop");
var DebuffType = require("./DebuffType");

function Debuff(params)
{
    params = params || {};

    var _this = this;

    var _name = params.name || "Missing name";
    var _description = params.description || "Missing description";
    var _duration = params.duration || 5000;
    var _type = params.type || DebuffType.None;
    var _effect = params.effect;
    var _icon = params.icon;

    var _loop = null;
    var _target = null;
    var _applied = false;

    _this.name = _name;
    _this.description = _description;
    _this.type = _type;
    _this.effect = _effect;
    _this.icon = _icon;

    _this.tooltip = _name + " -> " + _description;

    _this.start = function (target)
    {
        _target = target;

        _loop = new Loop("Debuff", _tick, _duration);
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
        if (!_applied)
        {
            _effect(_target);
            _applied = true;
        }
        else
        {
            _loop.stop();
            _target.removeDebuff(_this.name);
        }
    }
}

module.exports = Debuff;