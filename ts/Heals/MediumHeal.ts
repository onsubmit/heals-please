import { ActionName } from "ts/ActionName";
import Friendly from "ts/Friendly";
import Heal from "ts/Heal";
import { HealParams } from "ts/HealParams";
import Random from "ts/Random";

export default class MediumHeal extends Heal {
  private _critChance: number;
  private _critMultiplier: number;

  protected castTime: number = 2000;
  protected getOutcome = () => this.cast();

  override cast = () => {
    const isCrit = Math.random() < this._critChance;
    let healAmount = Random.fromIntegerIntervalInclusive(38, 50);

    if (isCrit) {
      healAmount = Math.round(healAmount * this._critMultiplier);
    }

    return this.target.heal(this.name, healAmount, isCrit);
  };

  manaCost: number = 60;
  name: ActionName = ActionName.MediumHeal;

  constructor(target: Friendly, params: HealParams) {
    super(target, params);

    this._critChance = 0.1;
    this._critMultiplier = 1.5;
  }
}
