const testcases = (() => {

  const allTwoArgBooleanPerms = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ];

  const allBirdTypes = [
    ["Flobby"],
    ["Bloggy"],
    ["Flibble"],
    ["Globby"],
  ];

  return {
    referenceImpls: {
      isFlobbyBird: (red, spotted) => (red && spotted),
      isBloggyBird: (red, spotted) => (red && !spotted),
      isFlibbleBird: (red, spotted) => (!red && spotted),
      isGlobbyBird: (red, spotted) => (!red && !spotted),
      eatsWorms: (red, spotted) => red || spotted,
      eatsNuts: (red, spotted) => red || !spotted,
      eatsFish: (red, spotted) => !red || spotted,
      eatsMice: (red, spotted) => !red || !spotted,
      isRed: (name) => name === 'Flobby' || name === 'Bloggy',
      isSpotted: (name) => name === 'Flobby' || name === 'Flibble',
      isNotRed: (name) => name === 'Globby' || name === 'Flibble',
      isNotSpotted: (name) => name === 'Bloggy' || name === 'Globby',
    },

    allCases: {
      "isFlobbyBird": allTwoArgBooleanPerms,
      "isBloggyBird": allTwoArgBooleanPerms,
      "isFlibbleBird": allTwoArgBooleanPerms,
      "isGlobbyBird": allTwoArgBooleanPerms,
      "eatsWorms": allTwoArgBooleanPerms,
      "eatsNuts": allTwoArgBooleanPerms,
      "eatsFish": allTwoArgBooleanPerms,
      "eatsMice": allTwoArgBooleanPerms,
      "isRed": allBirdTypes,
      "isSpotted": allBirdTypes,
      "isNotRed": allBirdTypes,
      "isNotSpotted": allBirdTypes,
    }
  }

})();
