export default class Trigger {
  private _callback: (healthPercentage: number) => boolean;
  private _triggered: boolean = false;

  execute = (healthPercentage: number) => {
    if (!this._triggered) {
      this._triggered = this._callback(healthPercentage);
    }
  };

  constructor(callback: (healthPercentage: number) => boolean) {
    this._callback = callback;
  }
}
