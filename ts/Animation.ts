import {
  Properties,
  VelocityOptions,
  VelocityProperty,
} from "velocity-animate";

export type AnimationWrapper = { animation: Animation };

export type Animation = {
  properties: Properties<VelocityProperty>;
  options: VelocityOptions;
};
