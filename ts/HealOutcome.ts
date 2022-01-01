export default class HealOutcome {
  private _amount: number = 0;
  private _isCrit: boolean = false;
  private _manaSpent: number = 0;
  private _overheal: number = 0;
  private _targetDied: boolean = false;
  private _wasCancelled: boolean = false;

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
