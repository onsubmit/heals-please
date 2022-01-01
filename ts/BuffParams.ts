import Friendly from "./Friendly";

export type BuffParams = {
  name: string;
  description: string;
  duration: number;
  target: Friendly;
  effect: (target: Friendly) => void;
  icon: any;
};
