import { BuffParams } from "./BuffParams";
import Friendly from "./Friendly";
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

  public description: string;
  public icon: any;
  public name: string;
  public pause = () => {
    this._loop.pause();
  };

  public resume = () => {
    this._loop.resume();
  };

  public start = (target: Friendly) => {
    this._target = target;
  };

  public stop = () => {
    this._loop.stop();
  };

  constructor(params: BuffParams) {
    const name = params.name;

    this.name = name;
    this.description = params.description;
    this._duration = params.duration;
    this._target = params.target;
    this._effect = params.effect;
    this.icon = params.icon;

    this._loop = new Loop(name, this._tick, this._duration);
  }

  public get tooltip() {
    return `${this.name} -> ${this.description}`;
  }
}
