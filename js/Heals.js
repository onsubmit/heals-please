var context = require.context("./Heals/", true, /\.js$/);

var Heals = {};
context.keys().forEach(
    function (filename)
    {
        var heal = context(filename);

        if (!heal.healName)
        {
            throw "Missing heal name";
        }

        if (Heals[heal.healName])
        {
            throw "Heal <" + heal.healName + "> already defined";
        }

        Heals[heal.healName] = heal;
    });


module.exports = Heals;