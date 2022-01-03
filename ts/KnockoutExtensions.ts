import * as ko from "knockout";
import Velocity, {
  Properties,
  VelocityElements,
  VelocityProperty,
} from "velocity-animate";
import { Animation, AnimationWrapper } from "./Animation";

export default function applyExtensions() {
  ko.bindingHandlers.animate = {
    update: (element: VelocityElements, valueAccessor: () => any) => {
      const currentCast = valueAccessor();

      if (!currentCast) {
        return;
      }

      ko.utils.arrayForEach(
        [].concat(currentCast.animation),
        (animationStep: Animation) => {
          animationStep.options.easing = "linear";
          Velocity(element, animationStep.properties, animationStep.options);
        }
      );
    },
  };

  ko.bindingHandlers.animateAction = {
    update: (
      element: VelocityElements,
      valueAccessor: () => any,
      allBindings: ko.AllBindings,
      viewModel: any,
      bindingContext: ko.BindingContext<any>
    ) => {
      const action: Properties<VelocityProperty> = ko.unwrap(valueAccessor());

      if (!action) {
        return;
      }

      if (!ko.bindingHandlers.animate.update) {
        return;
      }

      ko.bindingHandlers.animate.update(
        element,
        (): AnimationWrapper => {
          return { animation: { properties: action, options: {} } };
        },
        allBindings,
        viewModel,
        bindingContext
      );
    },
  };
}
