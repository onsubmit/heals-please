import Action from "ts/Action";
import AnimationHelpers from "ts/AnimationHelpers";
import Friendly from "ts/Friendly";

export default class Enrage extends Action {
  animation: any;

  constructor(targets: Friendly[], onSuccess: () => void) {
    super("Enrage");

    this.animation = [
      {
        properties: AnimationHelpers.fullWidth,
        options: {
          duration: 5000,
          begin: AnimationHelpers.removeStyleAttribute,
          complete: onSuccess,
        },
      },
    ];
  }
}
