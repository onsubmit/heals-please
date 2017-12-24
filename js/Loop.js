function Loop(name, callback, delay)
{
    var _this = this;

    _this.name = name;

    var _timerId;
    var _timerStart;
    var _timerRemaining;

    this.pause = function ()
    {
        _timerRemaining -= new Date().getTime() - _timerStart;

        clearTimeout(_timerId);
        _timerId = null;
    };

    this.resume = function ()
    {
        _loop(_timerRemaining);
    };

    _this.stop = function ()
    {
        _timerStart = null;
        _timerRemaining = null;

        clearTimeout(_timerId);
        _timerId = null;
    };

    _this.start = function ()
    {
        _loop();
    };

    function _loop(delayOverride)
    {
        (function runLoopIteration(innerDelayOverride)
        {
            _timerStart = new Date().getTime();
            _timerRemaining = innerDelayOverride || (typeof delay === "function" ? delay() : delay);

            _timerId = setTimeout(
                function ()
                {
                    callback();

                    // If the callback stopped the loop, _timerId will be null
                    if (_timerId)
                    {
                        runLoopIteration();
                    }
                }, _timerRemaining);
        })(delayOverride);
    }
}

module.exports = Loop;