import Velocity, { AnimationCall } from "velocity-animate";

class AnimationHelpers {
  public fadeOut = { opacity: [0, 1] };
  public fullWidth = { width: ["100%", "0%"] };
  public makeUpdateProgressFunction = (updateProgressFunction: any) => {
    // TODO: use types here
    return function (
      elements: any,
      complete: number,
      remaining: number,
      tweenValue: number,
      activeCall: AnimationCall
    ) {
      updateProgressFunction({
        complete: complete,
        remaining: remaining,
        start: new Date(Date.now() - (activeCall.ellapsedTime || 0)),
        tweenValue: tweenValue,
      });
    };
  };

  public pause = () => {
    const animatingElements: HTMLElement[] = Array.from(
      document.querySelectorAll<HTMLElement>(".velocity-animating")
    );

    Velocity(animatingElements, "pause");

    return animatingElements;
  };

  public removeStyleAttribute = (elements: HTMLElement[]) => {
    elements[0].removeAttribute("style");
  };

  public resume = () => {
    const pausedElements = Array.from(
      document.querySelectorAll<HTMLElement>(".velocity-animating")
    );
    Velocity(pausedElements, "resume");

    return pausedElements;
  };
}

export default new AnimationHelpers();
