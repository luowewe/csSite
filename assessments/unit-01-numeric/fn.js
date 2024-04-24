// Math.PI, Math.min, Math.ceil

const JUPITER_GRAVITY = 24.79;
const EARTH_GRAVITY = 9.8;
const G = 6.6743e-11;

const itemsLeftOver = (people, items) => people % items;

const areaOfCircle = (r) => Math.PI * r ** 2;

const volumeOfCube = (s) => s ** 3;

const populationGrowth = (currentPop, growthRate) => currentPop * growthRate;

const earnedRunAverage = (earnedRuns, inningsPitched) => (earnedRuns / inningsPitched) * 9;

const valueOfJewels = (diamonds, emeralds, diamondPrice, emeraldPrice) =>
  diamonds * diamondPrice + emeralds * emeraldPrice;

const payWithOvertime = (hours, normalRate, overtimeRate) => {
  const normal = Math.min(hours, 8);
  const overtime = hours - normal;
  return hours * normalRate + overtime * overtimeRate;
};

const firstClassPostage = (ounces) => 60 + (Math.ceil(ounces) - 1) * 24;

const weightOnJupiter = (weightOnEarth) => weightOnEarth * (JUPITER_GRAVITY / EARTH_GRAVITY);

const gravity = (mass1, mass2, distance) => (G * mass1 * mass2) / distance ** 2;

const quadratic = (a, b, c, x) => a * x ** 2 + b * x + c;

const weightedAverage = (fours, threes, twos, ones, zeros) => {
  const totalScores = fours * 4 + threes * 3 + twos * 2 + ones;
  const numberOfScores = fours + threes + twos + ones + zeros;
  return totalScores / numberOfScores;
};
