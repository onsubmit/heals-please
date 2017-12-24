var Velocity = require("velocity-animate");

exports.applyExtensions = function (ko)
{
    ko.bindingHandlers.animate =
    {
        update: function (element, valueAccessor)
        {
            var currentCast = valueAccessor();

            if (!currentCast)
            {
                return;
            }

            ko.utils.arrayForEach(
                [].concat(currentCast.animation),
                function (animationStep)
                {
                    Velocity(element, animationStep.properties, animationStep.options);
                }
            );
        }
    };

    ko.bindingHandlers.animateAction =
    {
        update: function (element, valueAccessor)
        {
            var action = ko.unwrap(valueAccessor());

            if (!action)
            {
                return;
            }

            ko.bindingHandlers.animate.update(
                element,
                function ()
                {
                    return { animation: { properties: action } };
                });
        }
    };
};