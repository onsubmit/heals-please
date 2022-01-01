import Velocity from "velocity-animate";
import * as ko from "knockout";

export default function applyExtensions() {
  ko.bindingHandlers.animate = {
    update: (element: any, valueAccessor: () => any) => {
      const currentCast = valueAccessor();

      if (!currentCast) {
        return;
      }

      ko.utils.arrayForEach(
        [].concat(currentCast.animation),
        (animationStep: any) => {
          Velocity(element, animationStep.properties, animationStep.options);
        }
      );
    },
  };

  ko.bindingHandlers.animateAction = {
    update: (
      element: any,
      valueAccessor: () => any,
      allBindings: ko.AllBindings,
      viewModel: any,
      bindingContext: ko.BindingContext<any>
    ) => {
      const action = ko.unwrap(valueAccessor());

      if (!action) {
        return;
      }

      if (!ko.bindingHandlers.animate.update) {
        return;
      }

      ko.bindingHandlers.animate.update(
        element,
        () => {
          return { animation: { properties: action } };
        },
        allBindings,
        viewModel,
        bindingContext
      );
    },
  };
}
