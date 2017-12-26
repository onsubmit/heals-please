var ko = require("knockout");

module.exports = function (initialValue)
{
    var _this = this;

    _this.value = ko.observable(initialValue);
    _this.previous = ko.observable(initialValue);

    (function _initialize()
    {
        _this.value.subscribe(
            function (newValue)
            {
                if (newValue !== null)
                {
                    _this.previous(newValue);
                }
            });
    })();
};