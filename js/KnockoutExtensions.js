var Velocity = require("velocity-animate");
var Draggable = require("Draggable");

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

    ko.bindingHandlers.draggable =
    {
        update: function (element, valueAccessor)
        {
            var allowDragging = ko.unwrap(valueAccessor());

            if (allowDragging)
            {
                element.draggableInstance = new Draggable(element, { threshold: 20, grid: 10, setCursor: true });
            }
            else if (element.draggableInstance)
            {
                element.draggableInstance.destroy();
            }
        }
    };
};