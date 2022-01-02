enum LoopState {
  Stopped = 0,
  Paused = 1,
  Running = 2,
}

export default class Loop {
  private _loop = (delayOverride?: number) => {
    this._runLoopIteration(delayOverride);
  };

  private _runLoopIteration = (delayOverride?: number) => {
    this._timerStart = new Date().getTime();
    this._timerRemaining =
      delayOverride ||
      (typeof this.delay === "function" ? this.delay() : this.delay);

    this._timerId = setTimeout(() => {
      if (this._state === LoopState.Running) {
        this.callback();
      }

      // The callback could have paused/stopped the loop.
      if (this._state === LoopState.Running) {
        this._runLoopIteration();
      }
    }, this._timerRemaining);
  };

  private _state: LoopState = LoopState.Stopped;
  private _timerId: number = -1;
  private _timerRemaining: number = -1;
  private _timerStart: number = -1;

  callback: () => void;
  delay: (() => number) | number;
  name: string;
  pause = () => {
    if (this._state !== LoopState.Running) {
      return;
    }

    this._timerRemaining -= new Date().getTime() - this._timerStart;

    clearTimeout(this._timerStart);
    this._timerStart = -1;
    this._state = LoopState.Paused;
  };

  resume = () => {
    if (this._state !== LoopState.Paused) {
      return;
    }

    this._state = LoopState.Running;
    this._loop(this._timerRemaining);
  };

  start = () => {
    this._state = LoopState.Running;

    if (this.startDelay) {
      setTimeout(this._loop, this.startDelay);
    } else {
      this._loop();
    }
  };

  startDelay: number;
  stop = () => {
    this._timerStart = -1;
    this._timerRemaining = -1;

    clearTimeout(this._timerId);
    this._timerId = -1;
    this._state = LoopState.Stopped;
  };

  constructor(
    name: string,
    callback: () => void,
    delay: (() => number) | number,
    startDelay?: number
  ) {
    this.name = name;
    this.callback = callback;
    this.delay = delay;
    this.startDelay = startDelay || 0;
  }
}
