const testcases = (() => {
  return {
    referenceImpls: {
      getX: (obj) => obj.x,
      point: (x, y) => ({ x, y }),
      emptyObject: () => ({}),
      distance: (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2),
      midpoint: (p1, p2) => ({
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      }),
      sumSalaries: (objs) => objs.reduce((acc, o) => acc + o.salary, 0),
      newHighScore: (high, ps) => ps.reduce((h, p) => Math.max(h, p.score), high),
      summarizeBooks: (books) => ({
        titles: books.map((b) => b.title),
        pages: books.reduce((tot, b) => tot + b.pages, 0),
      }),
    },

    allCases: {
      getX: [
        [
          {
            x: 10,
          },
        ],
        [
          {
            x: 100,
            y: 200,
          },
        ],
        [{}],
      ],
      point: [
        [10, 20],
        [20, 30],
        [0, 0],
      ],
      emptyObject: [[]],
      distance: [
        [
          {
            x: 10,
            y: 20,
          },
          {
            x: 30,
            y: -40,
          },
        ],
        [
          {
            x: 0,
            y: 0,
          },
          {
            x: 100,
            y: 200,
          },
        ],

        [
          {
            x: -13,
            y: -14,
          },
          {
            x: 15,
            y: 17,
          },
        ],
      ],
      midpoint: [
        [
          {
            x: 10,
            y: 20,
          },
          {
            x: 30,
            y: -40,
          },
        ],

        [
          {
            x: 0,
            y: 0,
          },
          {
            x: 100,
            y: 200,
          },
        ],

        [
          {
            x: -13,
            y: -14,
          },
          {
            x: 15,
            y: 17,
          },
        ],
      ],
      sumSalaries: [
        [[]],

        [
          [
            {
              salary: 126137,
            },
            {
              salary: 136781,
            },
            {
              salary: 105970,
            },
          ],
        ],

        [
          [
            {
              salary: 132400,
            },
            {
              salary: 133657,
            },
            {
              salary: 140664,
            },
            {
              salary: 103529,
            },
            {
              salary: 198045,
            },
            {
              salary: 110662,
            },
          ],
        ],

        [
          [
            {
              salary: 144674,
            },
          ],
        ],

        [
          [
            {
              salary: 187947,
            },
            {
              salary: 196200,
            },
            {
              salary: 123420,
            },
            {
              salary: 125858,
            },
            {
              salary: 131848,
            },
          ],
        ],

        [
          [
            {
              salary: 114132,
            },
            {
              salary: 136384,
            },
            {
              salary: 191687,
            },
            {
              salary: 161978,
            },
            {
              salary: 129093,
            },
          ],
        ],
      ],
      newHighScore: [
        [100, []],

        [
          137,
          [
            {
              score: 74,
            },
            {
              score: 69,
            },
            {
              score: 53,
            },
            {
              score: 68,
            },
            {
              score: 6,
            },
            {
              score: 76,
            },
            {
              score: 76,
            },
            {
              score: 43,
            },
            {
              score: 77,
            },
          ],
        ],

        [
          22,
          [
            {
              score: 84,
            },
            {
              score: 19,
            },
            {
              score: 26,
            },
            {
              score: 81,
            },
            {
              score: 9,
            },
            {
              score: 36,
            },
            {
              score: 36,
            },
            {
              score: 21,
            },
          ],
        ],

        [
          16,
          [
            {
              score: 65,
            },
            {
              score: 24,
            },
            {
              score: 94,
            },
            {
              score: 26,
            },
            {
              score: 60,
            },
            {
              score: 17,
            },
            {
              score: 73,
            },
            {
              score: 78,
            },
            {
              score: 8,
            },
          ],
        ],

        [
          161,
          [
            {
              score: 22,
            },
            {
              score: 63,
            },
            {
              score: 52,
            },
            {
              score: 10,
            },
            {
              score: 59,
            },
            {
              score: 42,
            },
          ],
        ],

        [89, [{ score: 73 }, { score: 2 }, { score: 12 }, { score: 51 }]],
      ],
      summarizeBooks: [
        [
          [
            {
              title: 'Flobby Bird Flies Again',
              pages: 67,
            },
            {
              title: 'Off by One',
              pages: 110,
            },
            {
              title: 'Nerd Jokes and Puns',
              pages: 120,
            },
            {
              title: 'Intro to Programming',
              pages: 33,
            },
          ],
        ],

        [
          [
            {
              title: 'Flobby Bird Flies Again',
              pages: 125,
            },
            {
              title: 'Off by One',
              pages: 80,
            },
            {
              title: 'Nerd Jokes and Puns',
              pages: 84,
            },
            {
              title: 'Intro to Programming',
              pages: 135,
            },
          ],
        ],

        [
          [
            {
              title: 'Flobby Bird Flies Again',
              pages: 60,
            },
            {
              title: 'Off by One',
              pages: 122,
            },
            {
              title: 'Nerd Jokes and Puns',
              pages: 64,
            },
            {
              title: 'Intro to Programming',
              pages: 163,
            },
          ],
        ],

        [
          [
            {
              title: 'Flobby Bird Flies Again',
              pages: 163,
            },
            {
              title: 'Off by One',
              pages: 53,
            },
            {
              title: 'Nerd Jokes and Puns',
              pages: 202,
            },
            {
              title: 'Intro to Programming',
              pages: 30,
            },
          ],
        ],

        [
          [
            {
              title: 'Flobby Bird Flies Again',
              pages: 71,
            },
            {
              title: 'Off by One',
              pages: 180,
            },
            {
              title: 'Nerd Jokes and Puns',
              pages: 144,
            },
            {
              title: 'Intro to Programming',
              pages: 197,
            },
          ],
        ],
      ],
    },
  };
})();
