class Random {
  fromFloatInterval = (min: number, max: number): number => {
    return (max - min) * Math.random() + min;
  };

  fromIntegerIntervalInclusive = (min: number, max: number): number => {
    return Math.round(Math.random() * (max - min + 1) + min);
  };

  nonNegativeIntegerUpToNonInclusive = (max: number): number => {
    return Math.floor(Math.random() * max);
  };
}

export default new Random();
