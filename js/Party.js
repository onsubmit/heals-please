var ko = require("knockout");
var Friendly = require("./Friendly.js");
var Random = require("./Random.js");

function Party(members)
{
    var _this = this;

    _this.members = null;

    _this.getRandomMembers = function (amount, allowDead)
    {
        if (!amount)
        {
            return [];
        }

        if (amount >= _this.members.length)
        {
            return _this.members;
        }

        var clone = allowDead
            ? [].concat(_this.members)
            : ko.utils.arrayFilter(
                _this.members,
                function (member)
                {
                    return !member.isDead();
                });

        if (amount >= clone.length)
        {
            return clone;
        }

        var chooseMembersToRemove = amount > clone.length - amount;
        amount = Math.min(amount, clone.length - amount);

        var randomMembers = [];
        for (var i = 0; i < amount; i++)
        {
            var index = Random.nonNegativeIntegerUpToNonInclusive(clone.length);
            randomMembers.push(clone.splice(index, 1)[0]);
        }

        return chooseMembersToRemove ? clone : randomMembers;
    };

    _this.start = function ()
    {
        _doMemberAction("start");
    };

    _this.stop = function ()
    {
        _doMemberAction("stop");
    };

    _this.pause = function ()
    {
        _doMemberAction("pause");
    };

    _this.resume = function ()
    {
        _doMemberAction("resume");
    };

    function _doMemberAction(functionName)
    {
        ko.utils.arrayForEach(
            _this.members,
            function (member)
            {
                member[functionName]();
            });
    }

    (function _initialize()
    {
        _this.members = [
            new Friendly("Tank", { health: 200 }),
            new Friendly("DPS #1"),
            new Friendly("DPS #2"),
            new Friendly("DPS #3")
        ].concat(members || []);
    })();
}

module.exports = Party;