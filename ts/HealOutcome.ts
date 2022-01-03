import { ActionName } from "./ActionName";

export default class HealOutcome {
  private _healName: ActionName;
  private _amount: number = 0;
  private _isCrit: boolean = false;
  private _isFromHotBuff: boolean = false;
  private _isFirstHotTick: boolean = false;
  private _manaSpent: number = 0;
  private _overheal: number = 0;
  private _targetDied: boolean = false;
  private _wasCancelled: boolean = false;

  constructor(healName: ActionName) {
    this._healName = healName;
  }

  get healName(): ActionName {
    return this._healName;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = value;
  }

  get effectiveAmount(): number {
    return this.amount - this._overheal;
  }

  get isCrit(): boolean {
    return this._isCrit;
  }

  set isCrit(value: boolean) {
    this._isCrit = value;
  }

  get isFromHotBuff(): boolean {
    return this._isFromHotBuff;
  }

  set isFromHotBuff(value: boolean) {
    this._isFromHotBuff = value;
  }

  get isFirstHotTick(): boolean {
    return this._isFirstHotTick;
  }

  set isFirstHotTick(value: boolean) {
    this._isFirstHotTick = value;
  }

  get manaSpent(): number {
    return this._manaSpent;
  }

  set manaSpent(value: number) {
    this._manaSpent = value;
  }

  get overheal(): number {
    return this._overheal;
  }

  set overheal(value: number) {
    this._overheal = value;
  }

  get targetDied(): boolean {
    return this._targetDied;
  }

  set targetDied(value: boolean) {
    this._targetDied = value;
  }

  get wasCancelled(): boolean {
    return this._wasCancelled;
  }

  set wasCancelled(value: boolean) {
    this._wasCancelled = value;
  }
}
