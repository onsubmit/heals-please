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

    var _timeout = null;
    var _numTicks = Math.floor(_duration / _interval);

    _this.name = _name;
    _this.description = _description;
    _this.icon = _icon;

    _this.start = function (target)
    {
        var _tickCount = 0;
        (function debuffLoop()
        {
            _timeout = setTimeout(
                function ()
                {
                    _effect(target);

                    if (++_tickCount < _numTicks)
                    {
                        debuffLoop(target);
                    }
                    else
                    {
                        _timeout = null;
                        target.removeDebuff(_this);
                    }
                },
                _interval);
        })();
    };

    _this.stop = function ()
    {
        clearTimeout(_timeout);
    }
}

module.exports = DotDebuff;