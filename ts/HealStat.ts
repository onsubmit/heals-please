import * as ko from "knockout";
import { ActionName } from "./ActionName";
import HealOutcome from "./HealOutcome";

export default class HealStat {
  private _effectiveAmount: ko.Observable<number>;
  name: ActionName;
  numCrits: ko.Observable<number>;
  numHeals: ko.Observable<number>;
  overheal: ko.Observable<number>;
  total: ko.Observable<number>;

  efficiency: ko.PureComputed<string> = ko.pureComputed(() => {
    if (this.numHeals() === 0 || this.total() === 0) {
      return "-";
    }
    const efficiency = (100 * this._effectiveAmount()) / this.total();
    return `${efficiency.toFixed(2)}%`;
  });

  reset = () => {
    this._effectiveAmount(0);
    this.numCrits(0);
    this.numHeals(0);
    this.overheal(0);
    this.total(0);
  };

  constructor(healName: ActionName) {
    this.name = healName;

    this._effectiveAmount = ko.observable(0);
    this.numCrits = ko.observable(0);
    this.numHeals = ko.observable(0);
    this.overheal = ko.observable(0);
    this.total = ko.observable(0);
  }

  add(healOutcome: HealOutcome) {
    if (!healOutcome.isFromHotBuff || healOutcome.isFirstHotTick) {
      this.numHeals(this.numHeals() + 1);
    }

    if (healOutcome.isCrit) {
      this.numCrits(this.numCrits() + 1);
    }

    this.total(this.total() + healOutcome.amount);
    this._effectiveAmount(
      this._effectiveAmount() + healOutcome.effectiveAmount
    );
    this.overheal(this.overheal() + healOutcome.overheal);
  }
}
