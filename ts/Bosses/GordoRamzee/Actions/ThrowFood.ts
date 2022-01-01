import Action from "ts/Action";
import AnimationHelpers from "ts/AnimationHelpers";
import { DotDebuff } from "ts/DotDebuff";
import Friendly from "ts/Friendly";
import Random from "ts/Random";
import Icon from "images/food-poisoning.svg";
import { DebuffType } from "ts/DebuffType";
import { Animation, AnimationWrapper } from "ts/Animation";
import Animations from "ts/Animations";

export default class ThrowFood extends Action {
  private _cast = () => {
    this.targets.forEach((target: Friendly) => {
      const harmAmount = Random.fromIntegerIntervalInclusive(12, 18);
      target.harm(harmAmount);

      if (!target.isDead() && Math.random() < 0.5) {
        const foodPoisoningDebuff = new DotDebuff({
          name: "Food Poisoning",
          description:
            "The food was bland and dry, dealing 8-16 damage every 1 second for 5 seconds.",
          icon: Icon,
          interval: 1000,
          duration: 5000,
          target: target,
          effect: (foodPoisoningTarget: Friendly, harmAmount: number) => {
            foodPoisoningTarget.harm(harmAmount);
            return harmAmount;
          },
          getTickDamage: (target: Friendly): number => {
            return Random.fromIntegerIntervalInclusive(8, 16);
          },
        });

        target.applyDebuff(foodPoisoningDebuff);
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
    super("Throw Food");

    this.targets = targets;
    this._onSuccess = onSuccess;

    const wrapper: AnimationWrapper = { ...Animations.fullWidth2000 };
    wrapper.animation.options.complete = this._complete;

    this.animation = [wrapper.animation];
  }
}
