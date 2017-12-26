function Trigger(callback)
{
    var _this = this;

    var _triggered = false;

    _this.execute = function (progress)
    {
        if (!_triggered)
        {
            _triggered = callback(progress);
        }
    };
}

module.exports = Trigger;