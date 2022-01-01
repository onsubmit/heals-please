import { DebuffParams } from "./DebuffParams";
import { DebuffType } from "./DebuffType";
import Friendly from "./Friendly";
import Loop from "./Loop";

export default class Debuff {
  private _applied: boolean = false;

  protected _duration: number;
  protected _loop: Loop;
  protected _target: Friendly;
  protected _tick = () => {
    if (!this._applied) {
      this.effect(this._target, 0);
      this._applied = true;
    } else {
      this._loop.stop();
      this._target.removeDebuff(this.name);
    }
  };

  description: string;
  effect: (target: Friendly, damage: number) => number;
  icon: any;
  name: string;
  pause = () => {
    this._loop.pause();
  };

  resume = () => {
    this._loop.resume();
  };

  start = (target: Friendly) => {
    this._target = target;
    this._loop.start();
  };

  stop = () => {
    this._loop.stop();
  };

  type: DebuffType;

  constructor(params: DebuffParams) {
    const name = params.name;

    this.name = name;
    this.description = params.description;
    this.type = params.type || DebuffType.None;
    this.effect = params.effect;
    this.icon = params.icon;

    this._duration = params.duration || 5000;

    this._target = params.target;
    this._loop = new Loop(name, this._tick, this._duration);
  }

  get tooltip() {
    return `${this.name} -> ${this.description}`;
  }
}
