import { DebuffType } from "./DebuffType";
import Friendly from "./Friendly";

export type DebuffParams = {
  name: string;
  description: string;
  type?: DebuffType;
  duration: number;
  target: Friendly;
  effect: (target: Friendly, harmAmount: number) => number;
  icon: any;
};
