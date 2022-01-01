import Debuff from "./Debuff";
import { DebuffParams } from "./DebuffParams";
import { DebuffType } from "./DebuffType";
import Friendly from "./Friendly";
import Loop from "./Loop";

type DotDebuffParams = DebuffParams & {
  interval: number;
  getTickDamage: (target: Friendly) => number;
};

export class DotDebuff extends Debuff {
  private _interval: number;
  private _numTicks: number;
  private _tickCount: number;
  private _getTickDamage: (target: Friendly) => number;

  protected override _tick = () => {
    this.effect(this._target, this._getTickDamage(this._target));

    if (this._duration > 0 && ++this._tickCount === this._numTicks) {
      this._loop.stop();
      this._target.removeDebuff(this.name);
    }
  };

  constructor(params: DotDebuffParams) {
    super(params);

    this.type = DebuffType.DamageOverTime;

    this._interval = params.interval || 2000;
    this._tickCount = 0;
    this._numTicks = Math.floor(this._duration / this._interval);
    this._getTickDamage = params.getTickDamage;

    this._loop = new Loop(params.name, this._tick, this._interval);
  }
}
