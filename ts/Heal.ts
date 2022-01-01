import AnimationHelpers from "./AnimationHelpers";
import Friendly from "./Friendly";
import { ActionName } from "./ActionName";
import { HealParams } from "./HealParams";
import HealOutcome from "./HealOutcome";

export default abstract class Heal {
  private _complete = () => {
    const outcome = this.getOutcome();
    this._onFinish(this, outcome);
  };

  private _onCancel: (action: Heal, outcome: HealOutcome) => void;
  private _onFinish: (action: Heal, outcome: HealOutcome) => void;
  private _updateProgress = (progress: { complete: number }) => {
    this.castProgress = progress.complete;
  };

  protected begin = (elements: HTMLElement[]) => {
    elements[0].style.width = "0%";
    AnimationHelpers.removeStyleAttribute(elements);
  };

  protected abstract castTime: number;
  protected abstract getOutcome: () => HealOutcome;
  protected target: Friendly;

  cancel = () => {
    const outcome = new HealOutcome();
    outcome.wasCancelled = true;

    this._onCancel(this, outcome);
  };

  abstract cast: () => HealOutcome;
  castProgress: number;
  isInstant: boolean;
  abstract manaCost: number;
  abstract name: ActionName;

  constructor(target: Friendly, params: HealParams) {
    this.target = target;

    this.isInstant = false;

    this._onFinish = params.onFinish;
    this._onCancel = params.onCancel;

    this.castProgress = 0.0;
  }

  get animation() {
    return [
      {
        properties: AnimationHelpers.fullWidth,
        options: {
          duration: this.castTime,
          begin: this.begin,
          progress: AnimationHelpers.makeUpdateProgressFunction(
            this._updateProgress
          ),
          complete: this._complete,
        },
      },
    ];
  }
}
