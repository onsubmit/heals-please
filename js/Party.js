var Random = require("./Random");

function Party(members)
{
    var _this = this;

    _this.members = members;

    _this.getRandomMembers = function (amount, allowPlayer, allowDead)
    {
        if (!amount)
        {
            return [];
        }

        if (amount >= _this.members.length)
        {
            return _this.members;
        }

        var clone = allowDead && allowPlayer
            ? [].concat(_this.members)
            : _this.members.filter(
                function (member)
                {
                    var allowed = true;

                    if (!allowPlayer)
                    {
                        allowed = !member.isPlayer;
                    }

                    if (allowed && !allowDead)
                    {
                        allowed = !member.isDead();
                    }

                    return allowed;
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

    _this.getLivingMembers = function ()
    {
        return _this.members.filter(
            function (member)
            {
                return !member.isDead();
            });
    };

    _this.getMemberByIndex = function (index)
    {
        return index >= 0 && _this.members.length > index ? _this.members[index] : null;
    };

    _this.isWiped = function ()
    {
        return _this.members.every(
            function (member)
            {
                return member.isDead();
            });
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
        _this.members.forEach(
            function (member)
            {
                member[functionName]();
            });
    }
}

module.exports = Party;