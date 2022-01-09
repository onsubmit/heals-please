import { DebuffName } from "./DebuffName";
import { DebuffType } from "./DebuffType";
import Friendly from "./Friendly";

export type DebuffParams = {
  name: DebuffName;
  description: string;
  type?: DebuffType;
  duration: number;
  target: Friendly;
  effect: (target: Friendly, harmAmount: number) => number;
  postHealCallback?: (target: Friendly) => void;
};
