import { ActionName } from "./ActionName";
import { BossName } from "./Bosses/BossName";

export default class Reward {
  healName: ActionName;
  bossName: BossName;

  constructor(healName: ActionName, bossName: BossName) {
    this.healName = healName;
    this.bossName = bossName;
  }
}
