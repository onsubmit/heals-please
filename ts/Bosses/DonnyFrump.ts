import Boss from "ts/Boss";
import Friendly from "ts/Friendly";
import Loop from "ts/Loop";
import Loops from "ts/Loops";
import Party from "ts/Party";
import Player from "ts/Player";
import Random from "ts/Random";
import Trigger from "ts/Trigger";
import { BossName } from "./BossName";
import AngryTweet from "./DonnyFrump/Actions/AngryTweet";
import Uncertainty from "./DonnyFrump/Actions/Uncertainty";
import Enrage from "./Shared/Actions/Enrage";

// The encounter begins and Donny Frump is not pleased people on Twitter are being mean to him.
// He casts Uncertainty on the entire raid, a debuff that does damage over time and
// does more damage as a party member's health decreases.
// He targets the tank and does 15-20 damage every 2-4 seconds.
// Every 10 seconds he sends an angry tweet, hitting 1-3 members of the party, damaging each between 6-20.
// There's a 30% chance the tweet contains egregious misinformation, confusing affected party members further,
// doubling their damage taken for 5 seconds.
// At 20% health, he enrages, soiling his diaper, and all damage done to the tank is doubled.
export default class DonnyFrump extends Boss {
  private _angryTweet = () => {
    this._getAttackTankLoop().pause();

    const numTargets = Random.fromIntegerIntervalInclusive(1, 3);
    const angryTweetTargets = this._raid.getRandomMembers(
      numTargets,
      true /* allowPlayer */
    );

    this.targets(angryTweetTargets);

    const angryTweet = new AngryTweet(angryTweetTargets, () => {
      this.finishCast(angryTweet);
      this._targetTank();
      this._getAttackTankLoop().resume();
    });

    this.cast(angryTweet);
  };

  private _attackTank = () => {
    this._targetTank();

    let attackTankAmount = Random.fromIntegerIntervalInclusive(15, 20);
    if (this._isEnraged) {
      attackTankAmount *= 2;
    }

    this._tank.harm(attackTankAmount);
  };

  private _castUncertainty = () => {
    this.targets(this._raid.members);

    const uncertainty = new Uncertainty(this._raid.members, () => {
      this.finishCast(uncertainty);
      this._targetTank();
      this.start();
    });

    this.cast(uncertainty);
  };

  private _enrage = () => {
    const enrage = new Enrage(
      [], // No specific target
      () => {
        this._isEnraged = true;

        this.finishCast(enrage);
        this._targetTank();
      }
    );

    this.cast(enrage);
  };

  private _getAttackTankLoop = () => {
    return this.getLoop("Attack Tank");
  };

  private _isEnraged: boolean;
  private _targetTank = () => {
    this.targets([this._tank]);
  };

  protected initialEvents: (() => void)[] = [];
  protected initialTargets: Friendly[] = [];
  protected loops: Loops;
  protected triggers: Trigger[];

  name: BossName;
  onDeathOfFriendly = (friendly: Friendly) => {
    if (friendly === this._tank) {
      // The tank just died.

      this.targets.remove(this._tank);

      const remainingAlive = this._raid.getLivingMembers();
      if (remainingAlive.length === 0) {
        this.stop();
        return;
      }

      if (remainingAlive.length === 1 && remainingAlive[0] === this._player) {
        // The player is the last one alive.
        this._tank = this._player;
      } else {
        // Choose some random DPS to become the new tank.
        this._tank = this._raid.getRandomDps();
      }

      this.targets.push(this._tank);
    }
  };

  constructor(
    player: Player,
    tank: Friendly,
    raid: Party,
    onDeathCallback: () => void
  ) {
    super(80000, player, tank, raid, onDeathCallback);

    this.name = BossName.DonnyFrump;
    this._isEnraged = false;

    this.loops = new Loops(
      new Loop("Attack Tank", this._attackTank, function () {
        return 1000 * Random.fromIntegerIntervalInclusive(2, 4);
      }),
      new Loop("Angry Tweet", this._angryTweet, 10000)
    );

    this.initialEvents = [this._castUncertainty];
    this.initialTargets = [this._tank];
    this.triggers = [
      new Trigger((healthPercentage: number) => {
        if (healthPercentage <= 20) {
          this._enrage();
          return true;
        }

        return false;
      }),
    ];
  }
}
