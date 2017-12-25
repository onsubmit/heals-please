var RequireHelper = require("./RequireHelper");

var Heals = RequireHelper.requireAll(
    require.context("./Heals/", true, /\.js$/),
    function (heal)
    {
        if (!heal.healName)
        {
            throw "Missing heal name";
        }

        return heal.healName;
    });


module.exports = Heals;