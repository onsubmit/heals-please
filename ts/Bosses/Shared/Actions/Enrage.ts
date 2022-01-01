import Action from "ts/Action";
import { Animation, AnimationWrapper } from "ts/Animation";
import Animations from "ts/Animations";
import Friendly from "ts/Friendly";

export default class Enrage extends Action {
  animation: Animation[];

  constructor(targets: Friendly[], onSuccess: () => void) {
    super("Enrage");

    const wrapper: AnimationWrapper = { ...Animations.fullWidth5000 };
    wrapper.animation.options.complete = onSuccess;

    this.animation = [wrapper.animation];
  }
}
