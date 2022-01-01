import Action from "ts/Action";
import AnimationHelpers from "ts/AnimationHelpers";
import Debuff from "ts/Debuff";
import { DebuffType } from "ts/DebuffType";
import Friendly from "ts/Friendly";
import Random from "ts/Random";
import Icon from "images/confusion.svg";
import Animations from "ts/Animations";
import { Animation, AnimationWrapper } from "ts/Animation";

export default class AngryTweet extends Action {
  private _cast = () => {
    this.targets.forEach((target: Friendly) => {
      const harmAmount = Random.fromIntegerIntervalInclusive(6, 20);
      target.harm(harmAmount);

      if (!target.isDead() && Math.random() < 0.3) {
        const confusionDebuff = new Debuff({
          name: "Confusion",
          description: "Damage taken is doubled for 5 seconds.",
          type: DebuffType.IncreaseDamageTaken,
          icon: Icon,
          duration: 5000,
          target: target,
          effect: (target: Friendly, damage: number): number => {
            // Damage taken is doubled.
            return damage * 2.0;
          },
        });

        target.applyDebuff(confusionDebuff);
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
    super("Angry Tweet");

    this.targets = targets;
    this._onSuccess = onSuccess;

    const wrapper: AnimationWrapper = { ...Animations.fullWidth2000 };
    wrapper.animation.options.complete = this._complete;

    this.animation = [wrapper.animation];
  }
}
