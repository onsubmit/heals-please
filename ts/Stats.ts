import * as ko from "knockout";
import { ActionName } from "./ActionName";
import HealOutcome from "./HealOutcome";
import HealStat from "./HealStat";

class Stats {
  private _healStats: Map<ActionName, HealStat>;

  healStats: ko.ObservableArray<HealStat>;

  constructor() {
    const initialStat = new HealStat(ActionName.SmallHeal);
    this._healStats = new Map([[ActionName.SmallHeal, initialStat]]);
    this.healStats = ko.observableArray<HealStat>([initialStat]);
  }

  reset() {
    this._healStats.forEach((stat: HealStat) => {
      stat.reset();
    });
  }

  update(healOutcome: HealOutcome) {
    let healStat = this._healStats.get(healOutcome.healName);
    if (healStat) {
      healStat.add(healOutcome);
    } else {
      healStat = new HealStat(healOutcome.healName);
      healStat.add(healOutcome);

      this._healStats.set(healOutcome.healName, healStat);
      this.healStats.push(healStat);
    }
  }
}

export default new Stats();
