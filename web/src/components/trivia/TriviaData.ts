/**
 * Trivia Data and Types
 * Updated to match the 24 questions from the database
 */

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  funFact: string;
  castaway: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    castaway: 'Cirie Fields',
    question:
      'Which Survivor 50 contestant holds the record for competing in the most seasons (including international)?',
    options: ['Ozzy Lusth', 'Cirie Fields', 'Joe Anglim', 'Colby Donaldson'],
    correctIndex: 1,
    funFact:
      'Cirie has played 5 times: Panama, Micronesia, HvV, Game Changers, and Australian Survivor',
  },
  {
    castaway: 'Angelina Keeley',
    question: 'In David vs. Goliath (S37), what was the final jury vote when Nick Wilson won?',
    options: [
      '7-3-0 (Nick-Mike-Angelina)',
      '6-2-2 (Nick-Mike-Angelina)',
      '5-3-2 (Nick-Mike-Angelina)',
      '8-0-0 (Nick unanimous)',
    ],
    correctIndex: 0,
    funFact: 'Angelina received zero jury votes despite making it to Final Tribal Council',
  },
  {
    castaway: 'Stephenie LaGrossa',
    question:
      'Which contestant was the LAST person standing from the infamous Ulong tribe in Palau?',
    options: ['Tom Westman', 'Katie Gallagher', 'Stephenie LaGrossa', 'Bobby Jon Drinkard'],
    correctIndex: 2,
    funFact:
      'Ulong lost every single immunity challenge, and Stephenie survived alone before being absorbed into Koror',
  },
  {
    castaway: 'Savannah Louie',
    question: 'How many individual immunity challenges did Savannah Louie win in Season 49?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    funFact: 'Savannah tied the record for most immunity wins by a woman in a single season',
  },
  {
    castaway: 'Joe Anglim',
    question:
      'Which Survivor 50 contestant collapsed during an immunity challenge due to exhaustion?',
    options: ['Jonathan Young', 'Joe Anglim', 'Ozzy Lusth', 'Coach Wade'],
    correctIndex: 1,
    funFact: 'Joe collapsed on Day 32 of Cambodia after pushing himself to the limit',
  },
  {
    castaway: 'Genevieve Mushaluk',
    question: 'Genevieve Mushaluk was known in Season 47 for being the queen of what?',
    options: ['Immunity wins', 'Blindsides', 'Finding idols', 'Social gameplay'],
    correctIndex: 1,
    funFact: 'Genevieve orchestrated multiple blindsides including the Kishan vote and Operation: Italy',
  },
  {
    castaway: 'Joe Anglim & Sierra',
    question:
      'Which two Survivor 50 contestants competed on the same original season and later got married?',
    options: [
      'Ozzy Lusth & Amanda Kimmel',
      'Joe Anglim & Sierra Dawn Thomas',
      'Colby Donaldson & Jerri Manthey',
      'Coach Wade & Debbie Beebe',
    ],
    correctIndex: 1,
    funFact: 'Joe and Sierra met on Worlds Apart (S30) and married in 2019',
  },
  {
    castaway: 'Kyle Fraser',
    question: 'Kyle Fraser won Survivor 48 with what final jury vote?',
    options: ['7-1-0', '6-2-0', '5-2-1', '4-3-1'],
    correctIndex: 2,
    funFact: 'All three finalists (Kyle, Eva, Joe) received at least one vote - a rare occurrence',
  },
  {
    castaway: 'Tiffany Ervin',
    question: 'Tiffany Ervin was blindsided in Season 46 while holding what in her pocket?',
    options: ['An extra vote', 'A hidden immunity idol', 'A fake idol', 'Shot in the dark'],
    correctIndex: 1,
    funFact: 'Tiffany was blindsided at Final 8 with an idol after Q exposed her advantage to the tribe',
  },
  {
    castaway: 'Rick Devens',
    question:
      'How many Hidden Immunity Idols did Rick Devens possess during Edge of Extinction (S38)?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    funFact: 'Rick holds the record for most idols possessed in a single season with 4',
  },
  {
    castaway: 'Colby Donaldson',
    question:
      'In Australian Outback, Colby made a controversial decision at Final 3. What did he do?',
    options: [
      'Kept the immunity necklace',
      'Took Tina instead of Keith to Final 2',
      'Refused to vote',
      'Gave away his reward',
    ],
    correctIndex: 1,
    funFact: "Colby's decision to take Tina cost him $1 million - she won 4-3",
  },
  {
    castaway: 'Ozzy Lusth',
    question: 'How many times has Ozzy Lusth competed on Survivor?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    funFact: 'Ozzy played in Cook Islands, Micronesia, South Pacific, and Game Changers',
  },
  {
    castaway: 'Coach Wade',
    question: "What is Coach Wade's self-proclaimed nickname?",
    options: ['The Warrior', 'The Dragon Slayer', 'The Maestro', 'The Survivor'],
    correctIndex: 1,
    funFact:
      "Coach's eccentric personality and stories made him one of Survivor's most memorable characters",
  },
  {
    castaway: 'Aubry Bracco',
    question: 'In Kaôh Rōng, Aubry lost the final jury vote to which winner?',
    options: ['Natalie Anderson', 'Michele Fitzgerald', 'Sarah Lacina', 'Wendell Holland'],
    correctIndex: 1,
    funFact: "The jury vote was 5-2 in favor of Michele in one of Survivor's most debated outcomes",
  },
  {
    castaway: 'Christian Hubicki',
    question: "What is Christian Hubicki's profession outside of Survivor?",
    options: ['Software Engineer', 'Robotics Scientist', 'Data Analyst', 'Math Teacher'],
    correctIndex: 1,
    funFact:
      "Christian's nerdy charm and puzzle-solving skills made him a fan favorite in David vs. Goliath",
  },
  {
    castaway: 'Mike White',
    question: 'Mike White is known outside Survivor for creating which hit TV show?',
    options: ['Succession', 'The White Lotus', 'Yellowjackets', 'The Bear'],
    correctIndex: 1,
    funFact:
      'Mike finished 2nd on David vs. Goliath and later won multiple Emmys for The White Lotus',
  },
  {
    castaway: 'Chrissy Hofbeck',
    question:
      'How many individual immunity challenges did Chrissy Hofbeck win in Heroes vs. Healers vs. Hustlers?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    funFact: "Chrissy tied the women's record for immunity wins at the time with 4 necklaces",
  },
  {
    castaway: 'Jonathan Young',
    question: 'Jonathan Young was known in Season 42 for his dominance in what area?',
    options: ['Puzzle solving', 'Physical challenges', 'Finding idols', 'Social manipulation'],
    correctIndex: 1,
    funFact: "Jonathan's incredible strength carried his tribe through the pre-merge challenges",
  },
  {
    castaway: 'Dee Valladares',
    question: 'Dee Valladares won Season 45 with what final jury vote?',
    options: ['7-1-0', '6-2-0', '5-3-0', '4-3-1'],
    correctIndex: 2,
    funFact: 'Dee dominated Season 45 and is considered one of the best New Era winners',
  },
  {
    castaway: 'Emily Flippen',
    question: 'Emily Flippen was known early in Season 45 for being extremely:',
    options: ['Strategic', 'Physical', 'Blunt and abrasive', 'Under the radar'],
    correctIndex: 2,
    funFact:
      'Emily had one of the best redemption arcs, going from most disliked to respected player',
  },
  {
    castaway: 'Q Burdette',
    question:
      'Q Burdette became infamous in Season 46 for repeatedly doing what at Tribal Council?',
    options: [
      'Refusing to vote',
      'Asking to be voted out',
      'Playing fake idols',
      'Switching his vote last second',
    ],
    correctIndex: 1,
    funFact:
      "Q's chaotic gameplay including asking to go home made him one of the most unpredictable players ever",
  },
  {
    castaway: 'Charlie Davis',
    question: 'Charlie Davis finished as runner-up in Season 46, losing to which winner?',
    options: ['Maria Shrime Gonzalez', 'Kenzie Petty', 'Ben Katzman', 'Liz Wilcox'],
    correctIndex: 1,
    funFact:
      'Charlie lost 5-3-0 despite being considered one of the best strategic players of the season',
  },
  {
    castaway: 'Kamilla Karthigesu',
    question: 'Kamilla Karthigesu was eliminated in Season 48 by losing what challenge?',
    options: ['Final immunity', 'Firemaking', 'Rock draw', 'Shot in the dark'],
    correctIndex: 1,
    funFact: 'The jury confirmed Kamilla would have won if she made Final Tribal Council',
  },
  {
    castaway: 'Rizo Velovic',
    question: 'Rizo Velovic holds what distinction as a Survivor contestant?',
    options: [
      'First Gen Z winner',
      'First Albanian-American contestant',
      'Youngest male finalist',
      'Most idols found by a rookie',
    ],
    correctIndex: 1,
    funFact:
      "Rizo, aka 'Rizgod,' was a superfan who became the first Albanian-American on the show",
  },
];

export const WRONG_MESSAGES = [
  'The Tribe Has Spoken.',
  'Your torch has been snuffed.',
  'Time for you to go.',
  'Blindsided!',
  "That's a vote against you.",
  "You've been voted out of the trivia.",
  'Grab your torch, head back to camp... to study.',
  "You didn't have the numbers.",
  "Should've played your idol.",
  'The jury saw right through that.',
];
