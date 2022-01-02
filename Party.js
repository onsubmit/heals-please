"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Party = void 0;
const Random_1 = __importDefault(require("./Random"));
class Party {
    constructor(members) {
        this.getRandomMembers = (amount, allowPlayer, allowDead) => {
            if (!amount) {
                return [];
            }
            if (amount >= this.members.length) {
                return this.members;
            }
            var clone = allowDead && allowPlayer
                ? Object.assign([], this.members)
                : this.members.filter(function (member) {
                    var allowed = true;
                    if (!allowPlayer) {
                        allowed = !member.isPlayer;
                    }
                    if (allowed && !allowDead) {
                        allowed = !member.isDead();
                    }
                    return allowed;
                });
            if (amount >= clone.length) {
                return clone;
            }
            var chooseMembersToRemove = amount > clone.length - amount;
            amount = Math.min(amount, clone.length - amount);
            var randomMembers = [];
            for (var i = 0; i < amount; i++) {
                var index = Random_1.default.nonNegativeIntegerUpToNonInclusive(clone.length);
                randomMembers.push(clone.splice(index, 1)[0]);
            }
            return chooseMembersToRemove ? clone : randomMembers;
        };
        this.getLivingMembers = () => {
            return this.members.filter(function (member) {
                return !member.isDead();
            });
        };
        this.getMemberByIndex = (index) => {
            return index >= 0 && this.members.length > index
                ? this.members[index]
                : null;
        };
        this.isWiped = () => this.members.every((member) => member.isDead());
        this.start = () => {
            this.members.forEach(function (member) {
                member.start();
            });
        };
        this.stop = () => {
            this.members.forEach(function (member) {
                member.stop();
            });
        };
        this.pause = () => {
            this.members.forEach(function (member) {
                member.pause();
            });
        };
        this.resume = () => {
            this.members.forEach(function (member) {
                member.resume();
            });
        };
        this.reset = () => {
            this.members.forEach(function (member) {
                member.reset();
            });
        };
        this.members = members;
    }
}
exports.Party = Party;
//# sourceMappingURL=Party.js.map