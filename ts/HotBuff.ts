import Buff from "./Buff";
import { BuffParams } from "./BuffParams";
import Friendly from "./Friendly";
import Loop from "./Loop";

type HotBuffParams = BuffParams & {
  interval: number;
};

export default class HotBuff extends Buff {
  private _interval: number;
  private _numTicks: number;
  private _tickCount: number;

  protected override _tick = () => {
    this._effect(this._target);

    if (++this._tickCount === this._numTicks) {
      this._loop.stop();
      this._target.removeBuff(this.name);
    }
  };

  override pause = () => {
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

  constructor(params: HotBuffParams) {
    super(params);

    this._interval = params.interval || 2000;
    this._tickCount = 0;
    this._numTicks = Math.floor(this._duration / this._interval);

    this._loop = new Loop(params.name, this._tick, this._interval);
  }
}
