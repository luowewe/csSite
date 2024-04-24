// Q: HOF
const redFruits = (fruits) => {
  const r = [];
  for (let i = 0; i < fruits.length; i++) {
    if (fruits[i].colors.includes('red')) {
      r.push(fruits[i]);
    }
  }
  return r;
};

// Q: HOF
const weights = (fruits) => {
  const r = [];
  for (let i = 0; i < fruits.length; i++) {
    r.push(fruits[i].grams);
  }
  return r;
};

// Q: HOF
const heaviest = (fruits) => {
  let h = 0;
  for (let i = 0; i < fruits.length; i++) {
    h = Math.max(h, fruits[i].grams);
  }
  return h;
};

// Q: HOF
const allColors = (fruits) => {
  const r = [];
  for (let i = 0; i < fruits.length; i++) {
    const colors = fruits[i].colors;
    for (let j = 0; j < colors.length; j++) {
      r.push(colors[j]);
    }
  }
  return r;
};

// Q: HOF
const areAllTasty = (fruits) => {
  for (let i = 0; i < fruits.length; i++) {
    if (!isTasty(fruits[i])) {
      return false;
    }
  }
  return true;
};

// Q: HOF
const notAllInconvenient = (fruits) => {
  for (let i = 0; i < fruits.length; i++) {
    if (!isInconvenient(fruits[i])) {
      return true;
    }
  }
  return false;
};

// Q: non-HOF
const tasty = (fruits) => {
  return fruits.filter(isTasty);
};

// Q: non-HOF
const names = (fruits) => {
  return fruits.map((f) => f.name);
};

// Q: non-HOF
const averageInconvenience = (fruits) => {
  return fruits.reduce((avg, fruit) => {
    return avg + fruit.inconvenience / fruits.length;
  }, 0);
};

// Q: non-HOF
const allCountries = (fruits) => {
  return fruits.flatMap((f) => f.grownIn);
};

// Q: non-HOF
const allGrownInMoreThanNCountries = (fruits, n) => {
  return fruits.every((f) => f.grownIn.length > n)
};

// Q: non-HOF
const someMoreThanNColors = (fruits, n) => {
  return fruits.some((f) => f.colors.length > n);
};
