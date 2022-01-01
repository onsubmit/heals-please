import { ActionName } from "./ActionName";
import Friendly from "./Friendly";
import Heal from "./Heal";
import { HealParams } from "./HealParams";
import Renew from "./Heals/Renew";
import SmallHeal from "./Heals/SmallHeal";

class HealFactory {
  create(healName: ActionName, target: Friendly, healParams: HealParams): Heal {
    switch (healName) {
      case ActionName.SmallHeal:
        return new SmallHeal(target, healParams);
      case ActionName.Renew:
        return new Renew(target, healParams);
    }
  }
}

export default new HealFactory();
