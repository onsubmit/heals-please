import Boss from "ts/Boss";
import Friendly from "ts/Friendly";
import Loop from "ts/Loop";
import Loops from "ts/Loops";
import Party from "ts/Party";
import Player from "ts/Player";
import Random from "ts/Random";
import Trigger from "ts/Trigger";
import ThrowFood from "./GordoRamzee/Actions/ThrowFood";
import Enrage from "./Shared/Actions/Enrage";

// The encounter begins and Gordo Ramzee is not pleased he is being interrupted.
// He targets the tank and does 20-25 damage every 2-4 seconds.
// Every 10 seconds, he throws food, hitting 2 members of the party, damaging each between 12-18.
// Affected party members eat the food. I mean, who wouldn't?
// There's a 50% chance the food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.
// At 20% health, he enrages and all damage done to the tank is doubled.
export default class GordoRamzee extends Boss {
  private _attackTank = () => {
    this._targetTank();

    let attackTankAmount = Random.fromIntegerIntervalInclusive(20, 25);
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

  private _throwFood = () => {
    this._getAttackTankLoop().pause();

    const throwFoodTargets = this._raid.getRandomMembers(
      2,
      true /* allowPlayer */
    );
    this.targets(throwFoodTargets);

    const throwFood = new ThrowFood(throwFoodTargets, () => {
      this.finishCast(throwFood);
      this._targetTank();
      this._getAttackTankLoop().resume();
    });

    this.cast(throwFood);
  };

  protected initialEvents: (() => void)[] = [];
  protected initialTargets: Friendly[] = [];
  protected loops: Loops;
  protected triggers: Trigger[];

  name: string;
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
    super(60000, player, tank, raid, onDeathCallback);

    this.name = "Gordo Ramzee";
    this._isEnraged = false;

    this.loops = new Loops(
      new Loop("Attack Tank", this._attackTank, function () {
        return 1000 * Random.fromIntegerIntervalInclusive(2, 4);
      }),
      new Loop("Throw Food", this._throwFood, 10000)
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
