import Boss from "ts/Boss";
import Friendly from "ts/Friendly";
import Loop from "ts/Loop";
import Loops from "ts/Loops";
import Party from "ts/Party";
import Player from "ts/Player";
import Random from "ts/Random";
import Trigger from "ts/Trigger";
import { BossName } from "./BossName";
import Gore from "./ElongTusk/Actions.ts/Gore";
import Stomp from "./ElongTusk/Actions.ts/Stomp";
import Enrage from "./Shared/Actions/Enrage";

// The encounter begins and Elong Tusk is displeased his company stock value dropped significantly.
// He targets the tank and does 8-12 damage every 1-2 seconds.
// Every 15 seconds, he gores one party member with his long tusk, damaging them between 24-42.
// Gored party members will bleed for 4 damage every second until healed to full.
// Immediately after goring, he will stomp his feet, damaging all members of the party for 16-28, and silencing the player if they are casting.
// At 20% health, he enrages and all damage done to the tank is doubled.
export default class ElongTusk extends Boss {
  private _attackTank = () => {
    this._targetTank();

    let attackTankAmount = Random.fromIntegerIntervalInclusive(8, 12);
    if (this._isEnraged) {
      attackTankAmount *= 2;
    }

    this._tank.harm(attackTankAmount);
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

  private _gore = () => {
    this._getAttackTankLoop().pause();

    const goreTargets = this._raid.getRandomMembers(1, true /* allowPlayer */);
    this.targets(goreTargets);

    const gore = new Gore(goreTargets, () => {
      this.finishCast(gore);
      this._targetTank();
      this._getAttackTankLoop().resume();
      this._stomp();
    });

    this.cast(gore);
  };

  private _stomp = () => {
    if (this._player.isDead()) {
      return;
    }

    this._getAttackTankLoop().pause();

    const stompTargets = this._raid.members;
    this.targets(stompTargets);

    const stomp = new Stomp(stompTargets, () => {
      this.finishCast(stomp);
      this._targetTank();
      this._getAttackTankLoop().resume();
    });

    this.cast(stomp);
  };

  protected initialEvents: (() => void)[] = [];
  protected initialTargets: Friendly[] = [];
  protected loops: Loops;
  protected triggers: Trigger[];

  name: BossName;
  onDeathOfFriendly = (friendly: Friendly): void => {
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
        this._tank = this._raid.getOneRandomNpc();
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
    super(102420, player, tank, raid, onDeathCallback);

    this.name = BossName.ElongTusk;
    this._isEnraged = false;

    this.loops = new Loops(
      new Loop("Attack Tank", this._attackTank, function () {
        return 1000 * Random.fromIntegerIntervalInclusive(2, 4);
      }),
      new Loop("Gore", this._gore, 15000)
    );

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
