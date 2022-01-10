import Friendly from "./Friendly";
import Player from "./Player";
import Random from "./Random";

export default class Party {
  getLivingMembers = (): Friendly[] => {
    return this.members.filter((member: Friendly) => {
      return !member.isDead();
    });
  };

  getMemberByIndex = (index: number): Friendly => {
    if (!this.members[index]) {
      throw `Could not get member at index ${index}`;
    }

    return this.members[index];
  };

  getOneRandomNpc = (): Friendly => this.getRandomMembers(1)[0];

  getRandomMembers = (
    amount: number,
    allowPlayer?: boolean,
    allowDead?: boolean
  ): Friendly[] => {
    if (amount === 0) {
      return [];
    }

    const clone =
      allowDead && allowPlayer
        ? Object.assign([], this.members)
        : this.members.filter((member: Friendly) => {
            let allowed = true;

            if (!allowPlayer) {
              allowed = !(member instanceof Player);
            }

            if (allowed && !allowDead) {
              allowed = !member.isDead();
            }

            return allowed;
          });

    if (amount >= clone.length) {
      return clone;
    }

    const chooseMembersToRemove = amount > clone.length - amount;
    amount = Math.min(amount, clone.length - amount);

    const randomMembers = [];
    for (let i = 0; i < amount; i++) {
      const index = Random.nonNegativeIntegerUpToNonInclusive(clone.length);
      randomMembers.push(clone.splice(index, 1)[0]);
    }

    return chooseMembersToRemove ? clone : randomMembers;
  };

  isWiped = () => this.members.every((member: Friendly) => member.isDead());

  members: Friendly[];
  pause = () => {
    this.members.forEach((member: Friendly) => {
      member.pause();
    });
  };

  reset = () => {
    this.members.forEach((member: Friendly) => {
      member.reset();
    });
  };

  resume = () => {
    this.members.forEach((member: Friendly) => {
      member.resume();
    });
  };

  start = () => {
    this.members.forEach((member: Friendly) => {
      member.start();
    });
  };

  stop = () => {
    this.members.forEach((member: Friendly) => {
      member.stop();
    });
  };

  constructor(members: Friendly[]) {
    this.members = members;
  }
}
