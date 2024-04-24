const testcases = (() => {
  return {
    referenceImpls: {
      pigLatin: (word) => {
        const i = word.search(/[aeiou]/);
        return word.substring(i) + word.substring(0, i) + 'ay';
      },

      advancedPigLatin: (word) => {
        return pigLatin(word.search(/[aeiou]/) === 0 ? 'w' + word : word);
      },
    },

    allCases: {
      pigLatin: [['car'], ['phone'], ['delight'], ['survivor']],
      advancedPigLatin: [['car'], ['phone'], ['delight'], ['survivor'], ['one'], ['expired']],
    },
  };
})();
