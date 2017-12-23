var Velocity = require("velocity-animate");

exports.applyExtensions = function (ko)
{
    ko.bindingHandlers.animate =
    {
        update: function (element, valueAccessor, allBindings)
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

    ko.bindingHandlers.animateFinish =
    {
        update: function (element, valueAccessor)
        {
            var finish = ko.unwrap(valueAccessor());

            if (!finish)
            {
                return;
            }

            ko.bindingHandlers.animate.update(
                element,
                function ()
                {
                    return { animation: [{ properties: "finish" }] };
                });
        }
    };
};