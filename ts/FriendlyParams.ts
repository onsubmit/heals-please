import Friendly from "./Friendly";

export type FriendlyParams = {
  health: number;
  maxHealth?: number;
  initialAttackDelay?: number;
  attackInterval?: number;
  onAttack: () => void;
  onDeath: (friendly: Friendly) => void;
};
