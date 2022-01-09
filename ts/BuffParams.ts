import { BuffName } from "./BuffName";
import Friendly from "./Friendly";

export type BuffParams = {
  name: BuffName;
  description: string;
  duration: number;
  target: Friendly;
  effect: (target: Friendly) => void;
};
