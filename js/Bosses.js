var RequireHelper = require("./RequireHelper");

var Bosses = RequireHelper.requireAll(
    require.context("./Bosses/", false, /\.js$/),
    function (boss)
    {
        if (!boss.name)
        {
            throw "Missing boss name";
        }

        return boss.name;
    });


module.exports = Bosses;