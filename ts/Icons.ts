import { ActionName } from "./ActionName";
import { DebuffName } from "./DebuffName";

const _actionIcons: Map<ActionName, string> = new Map([
  [ActionName.Renew, "🌿"],
]);

const _debuffIcons: Map<DebuffName, string> = new Map([
  [DebuffName.FoodPoisoning, "🤢"],
  [DebuffName.Confusion, "😕"],
  [DebuffName.Uncertainty, "😵‍💫"],
]);

export function getActionIcon(actionName: ActionName): string {
  const icon = _actionIcons.get(actionName);
  if (!icon) {
    throw new Error(`Could not find action icon for: ${actionName}`);
  }

  return icon;
}

export function getDebuffIcon(debuffName: DebuffName): string {
  const icon = _debuffIcons.get(debuffName);
  if (!icon) {
    throw new Error(`Could not find debuff icon for: ${debuffName}`);
  }

  return icon;
}
