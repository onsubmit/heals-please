import { BuffName } from "./BuffName";
import { DebuffName } from "./DebuffName";

export function getBuffIcon(buffName: BuffName): string {
  switch (buffName) {
    case BuffName.Renew:
      return "🌿";
  }
}

export function getDebuffIcon(debuffName: DebuffName): string {
  switch (debuffName) {
    case DebuffName.FoodPoisoning:
      return "🤢";
    case DebuffName.Confusion:
      return "😕";
    case DebuffName.Uncertainty:
      return "😵‍💫";
    case DebuffName.Bleed:
      return "🩸";
  }
}
