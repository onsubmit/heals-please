import { ActionName } from "./ActionName";
import { BossName } from "./Bosses/BossName";
import Reward from "./Reward";

class Rewards {
  get = (bossName: BossName): Reward | null => {
    switch (bossName) {
      case BossName.GordoRamzee:
        return new Reward(ActionName.Renew, BossName.DonnyFrump);
    }

    return null;
  };
}

export default new Rewards();
