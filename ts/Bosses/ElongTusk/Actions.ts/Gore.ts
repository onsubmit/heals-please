import Action from "ts/Action";
import { Animation, AnimationWrapper } from "ts/Animation";
import Animations from "ts/Animations";
import { DebuffName } from "ts/DebuffName";
import DotDebuff from "ts/DotDebuff";
import Friendly from "ts/Friendly";
import Random from "ts/Random";

export default class Gore extends Action {
  private _cast = () => {
    this.targets.forEach((target: Friendly) => {
      const harmAmount = Random.fromIntegerIntervalInclusive(24, 42);
      target.harm(harmAmount);

      if (!target.isDead()) {
        const bleedDebuff = new DotDebuff({
          name: DebuffName.Bleed,
          description:
            "Bleeding for 4 damage every second until healed to full.",
          interval: 1000,
          duration: -1,
          target: target,
          harmEffect: (foodPoisoningTarget: Friendly, harmAmount: number) => {
            foodPoisoningTarget.harm(harmAmount);
            return harmAmount;
          },
          getHarmAmount: (target: Friendly): number => 4,
          postHealCallback: (target: Friendly): void => {
            if (target.isAtFullHealth) {
              target.removeDebuff(DebuffName.Bleed);
            }
          },
        });

        target.applyDebuff(bleedDebuff);
      }
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
    super("Gore");

    this.targets = targets;
    this._onSuccess = onSuccess;

    const wrapper: AnimationWrapper = { ...Animations.fullWidth2000 };
    wrapper.animation.options.complete = this._complete;

    this.animation = [wrapper.animation];
  }
}
