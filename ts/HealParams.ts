import Heal from "./Heal";
import HealOutcome from "./HealOutcome";

export type HealParams = {
  onCancel: (action: Heal, outcome: HealOutcome) => void;
  onFinish: (action: Heal, outcome: HealOutcome) => void;
};
