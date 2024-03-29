import { ActionName } from "ts/ActionName";
import AnimationHelpers from "ts/AnimationHelpers";
import { BuffName } from "ts/BuffName";
import Friendly from "ts/Friendly";
import Heal from "ts/Heal";
import HealOutcome from "ts/HealOutcome";
import { HealParams } from "ts/HealParams";
import HotBuff from "ts/HotBuff";
import { VelocityCallbackFn, VelocityResult } from "velocity-animate";

export default class Renew extends Heal {
  private _critChance: number;
  private _critMultiplier: number;
  private _hasTicked: boolean = false;

  protected castTime: number = 250;
  protected getOutcome = (): HealOutcome => {
    const healOutcome = new HealOutcome(this.name);
    healOutcome.manaSpent = this.manaCost;
    return healOutcome;
  };

  protected override begin: VelocityCallbackFn = (
    elements?: VelocityResult
  ) => {
    AnimationHelpers.removeStyleAttribute(elements);
    this.cast();
  };

  override cast = () => {
    const renewBuff = new HotBuff({
      name: BuffName.Renew,
      description: "The target feels renewed, gaining health over time.",
      duration: 10000,
      interval: 2000,
      target: this.target,
      effect: (renewTarget: Friendly) => {
        const isCrit = Math.random() < this._critChance;
        let healAmount = 8;

        if (isCrit) {
          healAmount = Math.round(healAmount * this._critMultiplier);
        }

        renewTarget.heal(this.name, healAmount, isCrit, true, !this._hasTicked);

        this._hasTicked = true;
      },
    });

    this.target.applyBuff(renewBuff);

    const healOutcome = new HealOutcome(this.name);
    return healOutcome;
  };

  manaCost: number = 80;
  name: ActionName = ActionName.Renew;

  constructor(target: Friendly, params: HealParams) {
    super(target, params);

    this.isInstant = true;

    this._critChance = 0.1;
    this._critMultiplier = 1.5;
  }
}
