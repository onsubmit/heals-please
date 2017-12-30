function Trigger(callback)
{
    var _this = this;

    var _triggered = false;

    _this.execute = function (healthPercentage)
    {
        if (!_triggered)
        {
            _triggered = callback(healthPercentage);
        }
    };
}

module.exports = Trigger;