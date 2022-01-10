import Debuff from "./Debuff";
import { DebuffParams } from "./DebuffParams";
import { DebuffType } from "./DebuffType";
import Loop from "./Loop";

type DotDebuffParams = DebuffParams & {
  interval: number;
};

export default class DotDebuff extends Debuff {
  private _interval: number;
  private _numTicks: number;
  private _tickCount: number;

  protected override tick = () => {
    if (this.harmEffect) {
      this.harmEffect(this.target, this.getHarmAmount(this.target));
    }

    if (this.duration > 0 && ++this._tickCount === this._numTicks) {
      this.loop.stop();
      this.target.removeDebuff(this.name);
    }
  };

  constructor(params: DotDebuffParams) {
    super(params);

    this.type = DebuffType.DamageOverTime;

    this._interval = params.interval || 2000;
    this._tickCount = 0;
    this._numTicks = Math.floor(this.duration / this._interval);

    this.loop = new Loop(params.name, this.tick, this._interval);
  }
}
