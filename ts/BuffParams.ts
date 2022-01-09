import { ActionName } from "./ActionName";
import Friendly from "./Friendly";

export type BuffParams = {
  name: ActionName;
  description: string;
  duration: number;
  target: Friendly;
  effect: (target: Friendly) => void;
};
