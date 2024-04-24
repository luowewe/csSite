// Q: non-HOF
const evens = (numbers) => {
  return numbers.filter((n) => n % 2 === 0);
};

// Q: non-HOF
const shouty = (strings) => {
  return strings.map((s) => s.toUpperCase());
};

// Q: non-HOF
const join = (strings, delimiter) => {
  return strings.reduce((joined, s) => {
    if (joined === null) {
      return s;
    } else {
      return joined + delimiter + s;
    }
  }, null);
};

// Q: non-HOF
const allSiblings = (students) => {
  return students.flatMap((s) => s.siblings);
};

// Q: non-HOF
const allPassing = (students, passing) => {
  return students.every((s) => s.grade >= passing);
};

// Q: non-HOF
const someonesFavorite = (people, food) => {
  return people.some(p => p.favoriteFood === food);
};

// Q: HOF
const strange = (people) => {
  const r = [];
  for (let i = 0; i < people.length; i++) {
    if (people[i].isStrange) {
      r.push(people[i]);
    }
  }
  return r;
};

// Q: HOF
const birthdays = (students) => {
  const r = [];
  for (let i = 0; i < students.length; i++) {
    r.push(students[i].birthday);
  }
  return r;
};

// Q: HOF
const heaviest = (animals) => {
  let h = 0;
  for (let i = 0; i < animals.length; i++) {
    h = Math.max(h, animals[i].weight);
  }
  return h;
};

// Q: HOF
const allStudents = (grades) => {
  const r = [];
  for (let i = 0; i < grades.length; i++) {
    const inGrade = grades[i].students;
    for (let j = 0; j < inGrade.length; j++) {
      r.push(inGrade[j]);
    }
  }
  return r;
};

// Q: HOF
const allCromulent = (things) => {
  for (let i = 0; i < things.length; i++) {
    if (!isCromulent(things[i])) {
      return false;
    }
  }
  return true;
};


// Q: HOF
const notAllTerrible = (things) => {
  for (let i = 0; i < things.length; i++) {
    if (!isTerrible(things[i])) {
      return true;
    }
  }
  return false;
};
