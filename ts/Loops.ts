import Loop from "./Loop";

export default class Loops {
  private _loops: Map<string, Loop> = new Map();

  get = (loopName: string): Loop => {
    const loop: Loop | undefined = this._loops.get(loopName);
    if (!loop) {
      throw `Cannot find loop named ${loopName}`;
    }

    return loop;
  };

  pause = () => {
    this._loops.forEach((loop: Loop) => {
      loop.pause();
    });
  };

  resume = () => {
    this._loops.forEach((loop: Loop) => {
      loop.resume();
    });
  };

  start = () => {
    this._loops.forEach((loop: Loop) => {
      loop.start();
    });
  };

  stop = () => {
    this._loops.forEach((loop: Loop) => {
      loop.stop();
    });
  };

  constructor(...loops: Loop[]) {
    for (let loop of loops) {
      this._loops.set(loop.name, loop);
    }
  }
}
