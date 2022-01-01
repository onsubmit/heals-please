import * as ko from "knockout";
import PreviousValueTracker from "./PreviousValueTracker";

export default class ActionObservable<T> extends PreviousValueTracker<T> {
  action: ko.Observable<string>;

  constructor(initialValue?: T) {
    super(initialValue);
    this.action = ko.observable().extend({ notify: "always" });
  }
}
