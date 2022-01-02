import * as ko from "knockout";

export default class PreviousValueTracker<T> {
  previous: ko.Observable<T | null>;
  value: ko.Observable<T | null>;

  constructor(initialValue?: T) {
    this.value = ko.observable(initialValue || null);
    this.previous = ko.observable(initialValue || null);

    this.value.subscribe((newValue: T | null) => {
      if (newValue !== null) {
        this.previous(newValue);
      }
    });
  }
}
