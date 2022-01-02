import { AnimationWrapper } from "./Animation";
import AnimationHelpers from "./AnimationHelpers";

class Animations {
  fadeOut200: AnimationWrapper;
  fadeOut1000: AnimationWrapper;
  fullWidth2000: AnimationWrapper;
  fullWidth5000: AnimationWrapper;

  constructor() {
    this.fadeOut200 = {
      animation: {
        properties: AnimationHelpers.fadeOut,
        options: {
          duration: 200,
          complete: AnimationHelpers.removeStyleAttribute,
        },
      },
    };

    this.fadeOut1000 = {
      animation: {
        properties: AnimationHelpers.fadeOut,
        options: {
          duration: 1000,
          begin: AnimationHelpers.removeStyleAttribute,
        },
      },
    };

    this.fullWidth2000 = {
      animation: {
        properties: AnimationHelpers.fullWidth,
        options: {
          duration: 2000,
          begin: AnimationHelpers.removeStyleAttribute,
        },
      },
    };

    this.fullWidth5000 = {
      animation: {
        properties: AnimationHelpers.fullWidth,
        options: {
          duration: 5000,
          begin: AnimationHelpers.removeStyleAttribute,
        },
      },
    };
  }
}

export default new Animations();
