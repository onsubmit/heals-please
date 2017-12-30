var LoopState =
{
    Stopped: 0,
    Paused: 1,
    Running: 2
};

function Loop(name, callback, delay, startDelay)
{
    var _this = this;

    _this.name = name;

    var _timerId;
    var _timerStart;
    var _timerRemaining;
    var _state = LoopState.Stopped;

    _this.pause = function ()
    {
        if (_state !== LoopState.Running)
        {
            return;
        }

        _timerRemaining -= new Date().getTime() - _timerStart;

        clearTimeout(_timerId);
        _timerId = null;
        _state = LoopState.Paused;
    };

    _this.resume = function ()
    {
        if (_state !== LoopState.Paused)
        {
            return;
        }

        _state = LoopState.Running;
        _loop(_timerRemaining);
    };

    _this.stop = function ()
    {
        _timerStart = null;
        _timerRemaining = null;

        clearTimeout(_timerId);
        _timerId = null;
        _state = LoopState.Stopped;
    };

    _this.start = function ()
    {
        _state = LoopState.Running;

        if (startDelay)
        {
            setTimeout(_loop, startDelay);
        }
        else
        {
            _loop();
        }
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
                    if (_state === LoopState.Running)
                    {
                        callback();
                    }

                    // The callback could have paused/stopped the loop.
                    if (_state === LoopState.Running)
                    {
                        runLoopIteration();
                    }
                }, _timerRemaining);
        })(delayOverride);
    }
}

module.exports = Loop;