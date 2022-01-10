import Action from "ts/Action";
import { Animation, AnimationWrapper } from "ts/Animation";
import Animations from "ts/Animations";
import Debuff from "ts/Debuff";
import { DebuffName } from "ts/DebuffName";
import { DebuffType } from "ts/DebuffType";
import Friendly from "ts/Friendly";
import Player from "ts/Player";
import Random from "ts/Random";

export default class Stomp extends Action {
  private _cast = () => {
    this.targets.forEach((target: Friendly) => {
      const harmAmount = Random.fromIntegerIntervalInclusive(16, 28);
      target.harm(harmAmount);

      if (!(target instanceof Player)) {
        return;
      }

      const player = target as Player;
      if (!player.isDead() && player.currentCast.value()) {
        const silenceDebuff = new Debuff({
          name: DebuffName.Silence,
          description: "Silenced for 3 seconds.",
          type: DebuffType.Silence,
          duration: 3000,
          target: player,
        });

        player.cancelCast();
        player.applyDebuff(silenceDebuff);
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
    super("Stomp");

    this.targets = targets;
    this._onSuccess = onSuccess;

    const wrapper: AnimationWrapper = { ...Animations.fullWidth2000 };
    wrapper.animation.options.complete = this._complete;

    this.animation = [wrapper.animation];
  }
}
