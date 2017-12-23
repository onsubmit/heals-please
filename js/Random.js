module.exports =
{
    fromIntegerIntervalInclusive: function (min, max)
    {
        return Math.round(Math.random() * (max - min + 1) + min);
    },
    fromFloatInterval: function (min, max)
    {
        return (max - min) * Math.random() + min;
    },
    nonNegativeIntegerUpToNonInclusive: function (max)
    {
        return Math.floor((Math.random() * max));
    }
};