var ko = require("knockout");

function Loops()
{
    var _this = this;

    var _loops = arguments;

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
        ko.utils.arrayForEach(
            _loops,
            function (loop)
            {
                loop[functionName]();
            });
    }
}

module.exports = Loops;