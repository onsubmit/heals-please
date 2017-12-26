
var Velocity = require("velocity-animate");

module.exports =
{
    fullWidth: { width: "100%" },
    zeroWidth: { width: "0%" },
    removeStyleAttribute: function (elements)
    {
        elements[0].removeAttribute("style");
    },
    pause: function ()
    {
        var animatingElements = document.getElementsByClassName("velocity-animating");
        Velocity(animatingElements, "pause");

        return animatingElements;
    },
    resume: function ()
    {
        var pausedElements = document.getElementsByClassName("velocity-animating");
        Velocity(pausedElements, "resume");

        return pausedElements;
    },
    makeUpdateProgressFunction: function (updateProgressFunction)
    {
        return function (elements, complete, remaining, start, tweenValue)
        {
            updateProgressFunction({ complete: complete, remaining: remaining, start: start, tweenValue: tweenValue });
        };
    }
};