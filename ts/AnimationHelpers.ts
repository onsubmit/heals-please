import Velocity, {
  AnimationCall,
  HTMLorSVGElement,
  Properties,
  VelocityProgressFn,
  VelocityProperty,
  VelocityResult,
} from "velocity-animate";
import { AnimationProgress } from "./AnimationProgress";

class AnimationHelpers {
  fadeOut: Properties<VelocityProperty> = { opacity: [0, 1] };
  fullWidth: Properties<VelocityProperty> = { width: ["100%", "0%"] };
  makeUpdateProgressFunction = (
    updateProgressFunction: (progress: AnimationProgress) => void
  ): VelocityProgressFn => {
    return (
      elements: VelocityResult | undefined,
      complete: number | undefined,
      remaining: number | undefined,
      tweenValue: number | undefined,
      activeCall: AnimationCall | undefined
    ) => {
      updateProgressFunction({
        complete: complete,
        remaining: remaining,
        start: new Date(Date.now() - (activeCall?.ellapsedTime || 0)),
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

  public removeStyleAttribute = (
    elements: VelocityResult<HTMLorSVGElement> | undefined
  ) => {
    if (!elements || elements.length === 0) {
      return;
    }

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
