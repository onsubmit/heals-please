import { BuffName } from "./BuffName";
import { BuffParams } from "./BuffParams";
import Friendly from "./Friendly";
import { getBuffIcon } from "./Icons";
import Loop from "./Loop";

export default class Buff {
  private _applied: boolean = false;

  protected _duration: number;
  protected _effect: (target: Friendly) => void;
  protected _loop: Loop;
  protected _target: Friendly;
  protected _tick = () => {
    if (!this._applied) {
      this._effect(this._target);
      this._applied = true;
    } else {
      this._loop.stop();
      this._target.removeBuff(this.name);
    }
  };

  description: string;
  icon: string;
  name: BuffName;
  pause = () => {
    this._loop.pause();
  };

  resume = () => {
    this._loop.resume();
  };

  start = (target: Friendly) => {
    this._target = target;
  };

  stop = () => {
    this._loop.stop();
  };

  constructor(params: BuffParams) {
    const name = params.name;

    this.name = name;
    this.description = params.description;
    this._duration = params.duration;
    this._target = params.target;
    this._effect = params.effect;
    this.icon = getBuffIcon(name);

    this._loop = new Loop(name, this._tick, this._duration);
  }

  get tooltip() {
    return `${this.name} -> ${this.description}`;
  }
}
