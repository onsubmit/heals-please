var ko = require("knockout");

function Loops()
{
    var _this = this;

    var _loops = {};
    var _loopArguments = arguments;

    _this.get = function(loopName)
    {
        return _loops[loopName];
    }

    _this.start = function ()
    {
        _call("start");
    };

    _this.stop = function ()
    {
        _call("stop");
    };

    _this.pause = function ()
    {
        _call("pause");
    };

    _this.resume = function ()
    {
        _call("resume");
    };

    function _call(functionName)
    {
        ko.utils.objectForEach(
            _loops,
            function (loopName, loop)
            {
                loop[functionName]();
            });
    }

    (function _initialize()
    {
        ko.utils.arrayForEach(
            _loopArguments,
            function (loop)
            {
                _loops[loop.name] = loop;
            });
    })()
}

module.exports = Loops;