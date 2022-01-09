import Action from "ts/Action";
import { Animation, AnimationWrapper } from "ts/Animation";
import Animations from "ts/Animations";
import { DebuffName } from "ts/DebuffName";
import DotDebuff from "ts/DotDebuff";
import Friendly from "ts/Friendly";

export default class Uncertainty extends Action {
  private _cast = () => {
    this.targets.forEach((target: Friendly) => {
      const uncertaintyDebuff = new DotDebuff({
        name: DebuffName.Uncertainty,
        description:
          "Target can't tell what's true anymore. At full health, target takes 1 damage every 2 seconds. Increases to 5 per 2 seconds when near death.",
        interval: 2000,
        duration: -1,
        target: target,
        effect: (uncertaintyTarget: Friendly, harmAmount: number): number => {
          uncertaintyTarget.harm(harmAmount);
          return harmAmount;
        },
        getTickDamage: (uncertaintyTarget: Friendly): number => {
          // 1 dps @ 100% health
          // 5 dps @ 0% health
          return Math.round(-4 * uncertaintyTarget.healthPercentage() + 5);
        },
      });

      target.applyDebuff(uncertaintyDebuff);
    });
  };

  private _complete = () => {
    this._cast();
    this._onSuccess();
  };

  private _onSuccess: () => void;

  animation: Animation[];
  targets: Friendly[];

  constructor(targets: Friendly[], onSuccess: () => void) {
    super("Uncertainty");

    this.targets = targets;
    this._onSuccess = onSuccess;

    const wrapper: AnimationWrapper = { ...Animations.fullWidth2000 };
    wrapper.animation.options.complete = this._complete;

    this.animation = [wrapper.animation];
  }
}
