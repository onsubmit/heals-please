import * as ko from "knockout";
import Action from "ts/Action";
import ActionObservable from "./ActionObservable";
import Friendly from "./Friendly";
import Loop from "./Loop";
import Loops from "./Loops";
import Party from "./Party";
import Player from "./Player";
import Trigger from "./Trigger";

export default abstract class Boss {
  private _adjustHealth = (amount: number) => {
    const newHealth = this.health() + amount;

    if (newHealth <= 0) {
      this.health(0);
      this._updateProgress(0);
      this._onDeath();
    } else if (newHealth <= this.maxHealth) {
      this.health(newHealth);
      this._updateProgress((100.0 * newHealth) / this.maxHealth);
    } else {
      this.health(this.maxHealth);
      this._updateProgress(100);
    }
  };

  private _onDeath = () => {
    this.stop();
    this.isDead(true);
    this._onDeathCallback();
  };

  private _updateProgress = (healthPercentage: number) => {
    this.triggers.forEach((trigger: Trigger) => {
      trigger.execute(healthPercentage);
    });
  };

  protected _onDeathCallback: () => any;
  protected _player: Friendly;
  protected _raid: Party;
  protected _tank: Friendly;
  protected abstract initialEvents: (() => void)[];
  protected abstract initialTargets: Friendly[];
  protected abstract loops: Loops;
  protected abstract triggers: Trigger[];

  cast = (action: Action) => {
    this.currentCasts.push(new ActionObservable<Action>(action));
  };

  currentCasts: ko.ObservableArray<ActionObservable<Action>>;
  engage = () => {
    this.initialEvents.forEach((initialEvent: () => void) => {
      initialEvent();
    });

    this.targets(Object.assign([], this.initialTargets));

    this.start();
  };

  finishCast = (action: any) => {
    this.currentCasts.remove((cast: any) => {
      return cast.value() === action;
    });
  };

  getLoop = (loopName: string): Loop => this.loops.get(loopName);

  harm = (amount: number) => this._adjustHealth(0 - amount);

  health: ko.Observable<number>;
  healthPercentageString: ko.PureComputed<string> = ko.pureComputed(
    () => `${(100.0 * this.health()) / this.maxHealth}%`
  );
  isDead: ko.Observable<boolean>;
  maxHealth: number;
  abstract name: string;
  abstract onDeathOfFriendly: (friendly: Friendly) => void;
  pause = () => {
    this.loops.pause();
  };

  reset = () => {
    this.health(this.maxHealth);
    this._tank = this.initialTargets[0];
  };

  resume = () => {
    this.loops.resume();
  };

  start = () => {
    this.loops.start();
  };

  stop = () => {
    this.targets.removeAll();
    this.loops.stop();

    this.currentCasts().forEach((cast: any) => {
      cast.action("finish");
    });
  };

  targets: ko.ObservableArray<Friendly>;

  constructor(
    health: number,
    player: Player,
    tank: Friendly,
    raid: Party,
    onDeathCallback: () => void
  ) {
    this.health = ko.observable(health);
    this.isDead = ko.observable(false);
    this.targets = ko.observableArray<Friendly>([]);
    this.currentCasts = ko.observableArray<ActionObservable<Action>>([]);

    this.maxHealth = health;

    this._player = player;
    this._tank = tank;
    this._raid = raid;
    this._onDeathCallback = onDeathCallback;
  }
}
