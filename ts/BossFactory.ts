import Boss from "./Boss";
import { BossName } from "./Bosses/BossName";
import DonnyFrump from "./Bosses/DonnyFrump";
import ElongTusk from "./Bosses/ElongTusk";
import GordoRamzee from "./Bosses/GordoRamzee";
import Friendly from "./Friendly";
import Party from "./Party";
import Player from "./Player";

class BossFactory {
  create(
    bossName: BossName,
    player: Player,
    tank: Friendly,
    raid: Party,
    onDeathCallback: () => void
  ): Boss {
    switch (bossName) {
      case BossName.GordoRamzee:
        return new GordoRamzee(player, tank, raid, onDeathCallback);
      case BossName.DonnyFrump:
        return new DonnyFrump(player, tank, raid, onDeathCallback);
      case BossName.ElongTusk:
        return new ElongTusk(player, tank, raid, onDeathCallback);
    }
  }
}

export default new BossFactory();
