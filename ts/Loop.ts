enum LoopState {
  Stopped = 0,
  Paused = 1,
  Running = 2,
}

export default class Loop {
  private _callback: () => void;
  private _delay: (() => number) | number;
  private _loop = (delayOverride?: number) => {
    this._runLoopIteration(delayOverride);
  };

  private _runLoopIteration = (delayOverride?: number) => {
    this._timerStart = new Date().getTime();
    this._timerRemaining =
      delayOverride ||
      (typeof this._delay === "function" ? this._delay() : this._delay);

    this._timerId = setTimeout(() => {
      if (this._state === LoopState.Running) {
        this._callback();
      }

      // The callback could have paused/stopped the loop.
      if (this._state === LoopState.Running) {
        this._runLoopIteration();
      }
    }, this._timerRemaining);
  };

  private _startDelay: number;
  private _state: LoopState = LoopState.Stopped;
  private _timerId: number = -1;
  private _timerRemaining: number = -1;
  private _timerStart: number = -1;

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

  restart = () => {
    this.stop();
    this.start(LoopState.Paused);
  };

  start = (initialState: LoopState = LoopState.Running) => {
    this._state = initialState;

    if (this._startDelay) {
      setTimeout(this._loop, this._startDelay);
    } else {
      this._loop();
    }
  };

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
    startDelay: number = 0
  ) {
    this.name = name;
    this._callback = callback;
    this._delay = delay;
    this._startDelay = startDelay;
  }
}
