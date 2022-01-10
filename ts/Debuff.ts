import { DebuffName } from "./DebuffName";
import { DebuffParams } from "./DebuffParams";
import { DebuffType } from "./DebuffType";
import Friendly from "./Friendly";
import { getDebuffIcon } from "./Icons";
import Loop from "./Loop";

export default class Debuff {
  private _postHealCallback?: (target: Friendly) => void;

  protected duration: number;
  protected loop: Loop;
  protected getHarmAmount: (target: Friendly) => number;
  protected target: Friendly;
  protected tick = () => {
    this.loop.stop();
    this.target.removeDebuff(this.name);
  };

  description: string;
  harmEffect?: (target: Friendly, harmAmount: number) => number;
  icon: string;
  name: DebuffName;
  pause = () => {
    this.loop.pause();
  };

  resume = () => {
    this.loop.resume();
  };

  restart = () => {
    this.loop.restart();
  };

  start = (target: Friendly) => {
    this.target = target;
    if (this.harmEffect) {
      this.harmEffect(this.target, 0);
    }
    this.loop.start();
  };

  stop = () => {
    this.loop.stop();
  };

  postHealCallback = (target: Friendly): void => {
    if (this._postHealCallback) {
      this._postHealCallback(target);
    }
  };

  type: DebuffType;

  constructor(params: DebuffParams) {
    const name = params.name;

    this.name = name;
    this.description = params.description;
    this.type = params.type || DebuffType.None;
    this.harmEffect = params.harmEffect;
    this.getHarmAmount = params.getHarmAmount || ((target: Friendly) => 0);
    this.icon = getDebuffIcon(name);
    this._postHealCallback = params.postHealCallback;

    this.duration = params.duration || 5000;

    this.target = params.target;
    this.loop = new Loop(name, this.tick, this.duration);
  }

  get tooltip() {
    return `${this.name} -> ${this.description}`;
  }
}
