var ko = require("knockout");

exports.observable = function ()
{
    var value = ko.utils.extend(ko.observable(), { previous: ko.observable() });

    value.subscribe(
        function (newValue)
        {
            if (newValue !== null)
            {
                value.previous(newValue);
            }
        });

    return value;
};