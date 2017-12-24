module.exports =
{
    fullWidth: { width: "100%" },
    zeroWidth: { width: "0%" },
    removeStyleAttribute: function (elements)
    {
        elements[0].removeAttribute("style");
    },
    makeUpdateProgressFunction: function (updateProgressFunction)
    {
        return function (elements, complete, remaining, start, tweenValue)
        {
            updateProgressFunction({ complete: complete, remaining: remaining, start: start, tweenValue: tweenValue });
        };
    }
};