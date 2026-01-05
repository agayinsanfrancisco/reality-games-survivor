/**
 * Trivia Data and Types
 * Generated from Season 50 castaway fun facts - 24 questions total (one per castaway)
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
    castaway: 'Angelina Keeley',
    question: 'Angelina Keeley is the founder and CEO of what type of organization?',
    options: ['Tech startup', 'Nonprofit for young girls', 'Fashion brand', 'Restaurant chain'],
    correctIndex: 1,
    funFact:
      'Angelina founded Miss Limitless, a nonprofit that encourages and empowers young girls to run for student government positions.',
  },
  {
    castaway: 'Aubry Bracco',
    question: "What was Aubry Bracco's claim to fame according to her Edge of Extinction profile?",
    options: [
      'Winning immunity 4 times',
      'Neutralizing a Super Idol',
      'Finding 3 idols',
      'Making fire fastest',
    ],
    correctIndex: 1,
    funFact:
      "Aubry's Survivor audition video was posted online by casting for many years as an example of a good audition video.",
  },
  {
    castaway: 'Charlie Davis',
    question: 'Charlie Davis co-hosted which official Survivor podcast?',
    options: [
      'RHAP',
      'Survivor Know-It-Alls',
      'On Fire with Jeff Probst',
      'The Ringer Survivor Show',
    ],
    correctIndex: 2,
    funFact:
      'Charlie graduated from Boston College law school and is known as a Taylor Swift superfan.',
  },
  {
    castaway: 'Chrissy Hofbeck',
    question: 'How many years did Chrissy Hofbeck apply to be on Survivor before being cast?',
    options: ['5 years', '10 years', '16 years', '20 years'],
    correctIndex: 2,
    funFact:
      'Chrissy is one of six women to win 4 individual immunities in a single season and was gifted the Super Idol on Day 1.',
  },
  {
    castaway: 'Christian Hubicki',
    question: 'Christian Hubicki once won a challenge due to his ability to do what for 5 hours?',
    options: [
      'Hold his breath',
      'Balance on a perch',
      'Make conversation with Jeff',
      'Solve puzzles repeatedly',
    ],
    correctIndex: 2,
    funFact:
      'Christian won a 5-hour endurance challenge, in part due to his ramblings and attempts to make conversations with Jeff Probst.',
  },
  {
    castaway: 'Cirie Fields',
    question: 'What major accomplishment did Cirie Fields achieve after Survivor?',
    options: ['Won Big Brother', 'Won The Traitors', 'Won The Amazing Race', 'Won The Challenge'],
    correctIndex: 1,
    funFact:
      "Cirie is the first player to compete 6 times and was famously eliminated by 'Advantageddon' with zero votes against her.",
  },
  {
    castaway: 'Coach Wade',
    question: 'What unique professional title does Coach Wade hold?',
    options: ['Olympic Athlete', 'Symphony Conductor', 'Marine Biologist', 'Astronaut'],
    correctIndex: 1,
    funFact:
      "Coach, nicknamed 'The Dragon Slayer,' was the first returning player to reach Final Tribal Council without receiving a single vote throughout the season.",
  },
  {
    castaway: 'Colby Donaldson',
    question: 'Colby Donaldson set what record in Australian Outback?',
    options: [
      'Most tribal councils attended',
      '5 consecutive individual immunity wins',
      'Most votes against',
      'Longest fire-making challenge',
    ],
    correctIndex: 1,
    funFact:
      'Colby was the first castaway to fall victim to the Car Curse and is forever associated in Survivor lore with Jerri Manthey.',
  },
  {
    castaway: 'Dee Valladares',
    question: 'Dee Valladares had a quirky talking point about having what?',
    options: ['Million-dollar smile', 'Million-dollar toes', 'Lucky socks', 'Magic hands'],
    correctIndex: 1,
    funFact:
      'Dee immigrated from Cuba at age 2 and had a showmance with Austin Li Coon during her season.',
  },
  {
    castaway: 'Emily Flippen',
    question: 'Emily Flippen is remembered for a key confessional that was loosened by what?',
    options: ['A nap', 'Winning reward', 'A large glass of wine', 'Finding an idol'],
    correctIndex: 2,
    funFact:
      'Emily challenged a returning player on the opening mat for having an advantage, and Survivor fans love making memes about her job title and name.',
  },
  {
    castaway: 'Genevieve Mushaluk',
    question:
      "Which memorable quote is associated with Genevieve Mushaluk's gameplay in Season 47?",
    options: [
      'The tribe has spoken',
      'Make Kishan the plan',
      'Blindside the blindsider',
      'Trust the process',
    ],
    correctIndex: 1,
    funFact:
      "Genevieve was part of 'Operation: Italy' and intentionally started emotionless then realized emotion was key to her game.",
  },
  {
    castaway: 'Jenna Lewis-Dougherty',
    question: 'Jenna Lewis-Dougherty holds what impressive Survivor gap record?',
    options: [
      'Longest time between seasons (42)',
      'Most reunions attended',
      'Most tribal councils',
      'Most confessionals',
    ],
    correctIndex: 0,
    funFact:
      'Jenna was the only Borneo contestant to make merge in All-Stars and co-hosted a podcast with Rob Cesternino prior to RHAP.',
  },
  {
    castaway: 'Joe Hunter',
    question: "What is notable about Joe Hunter's voting record in Season 48?",
    options: [
      'Received the most votes',
      'Never received a single vote',
      'Voted wrong every time',
      'Never voted',
    ],
    correctIndex: 1,
    funFact:
      'Joe is an advocate for domestic violence prevention and survivors, and attended the Emmys as a guest after his season.',
  },
  {
    castaway: 'Jonathan Young',
    question: 'Jonathan Young holds a Guinness World Record for doing what?',
    options: [
      'Most push-ups in a minute',
      '15 chin-ups with 100 lbs in 60 seconds',
      'Longest plank',
      'Fastest mile carrying weight',
    ],
    correctIndex: 1,
    funFact:
      'Jonathan was originally cast for Season 41 before filming was suspended due to COVID-19, and is remembered for single-handedly dragging his boat through rough waters.',
  },
  {
    castaway: 'Kamilla Karthigesu',
    question: "What do Kamilla Karthigesu's fans call themselves?",
    options: ['Kamilla Crew', 'The Kamillitary', 'Team Kamilla', 'Karthigesu Nation'],
    correctIndex: 1,
    funFact:
      'Kamilla had a game-long secret alliance revealed during Final Tribal Council and intentionally made people look worse than her.',
  },
  {
    castaway: 'Kyle Fraser',
    question: 'What mishap occurred when Kyle Fraser competed in a reward challenge?',
    options: ['Broke the puzzle', 'Broke the water jug', 'Lost his shoes', 'Forgot the rules'],
    correctIndex: 1,
    funFact:
      'Kyle talks openly about his history of incarceration and had a game-long secret alliance revealed during Final Tribal Council.',
  },
  {
    castaway: 'Mike White',
    question: "Mike White found another castaway's hidden immunity idol clue while doing what?",
    options: ['Fishing', 'Building shelter', 'Drinking wine', 'Taking a nap'],
    correctIndex: 2,
    funFact:
      "Mike is the creator of 'The White Lotus' and wrote 'School of Rock.' He's a close friend of Survivor host Jeff Probst.",
  },
  {
    castaway: 'Ozzy Lusth',
    question: 'Ozzy Lusth created a historic first in Survivor by doing what?',
    options: [
      'Winning 5 immunities in a row',
      'Making a fake idol that was played by another castaway',
      'Finding 4 idols',
      'Competing without getting votes',
    ],
    correctIndex: 1,
    funFact:
      'Ozzy was voted out three times in a single season and was blindsided by the Black Widow Brigade.',
  },
  {
    castaway: 'Q Burdette',
    question: 'Q Burdette is the inventor of what unique Survivor fashion item?',
    options: ['The Q-Hat', 'The Q-Skirt', 'The Q-Bandana', 'The Q-Shoes'],
    correctIndex: 1,
    funFact:
      "Q famously said, 'Thought she could rally the troops and send me packing? You can cancel Christmas, girl.'",
  },
  {
    castaway: 'Rick Devens',
    question: 'Rick Devens was the first castaway to co-host which podcast?',
    options: ['RHAP', 'On Fire with Jeff Probst', 'Survivor Winners at War', 'The Drop'],
    correctIndex: 1,
    funFact:
      'Rick re-entered the game after winning the re-entry duel challenge at the merge and possessed four hidden immunity idols during the season.',
  },
  {
    castaway: 'Rizo Velovic',
    question: 'How did Rizo Velovic infamously win a tribe supplies challenge?',
    options: [
      'Solving it first',
      "Copying a competitor's puzzle",
      'Getting help from his tribe',
      'Finding a shortcut',
    ],
    correctIndex: 1,
    funFact:
      'Rizo held a publicly known immunity idol through nine Tribal Councils and was the first Survivor player of Albanian descent.',
  },
  {
    castaway: 'Savannah Louie',
    question: 'What distinction does Savannah Louie hold among female Survivor contestants?',
    options: [
      'Most confessionals',
      'Most individual immunity wins in a season (4)',
      'Longest challenge win',
      'Most votes survived',
    ],
    correctIndex: 1,
    funFact:
      'Savannah was part of an all-female Final Tribal Council, the first time in 20 seasons. She received her first callback for Survivor at age 19.',
  },
  {
    castaway: 'Stephenie LaGrossa Kendrick',
    question: 'What injury did Stephenie LaGrossa famously suffer and immediately fix herself?',
    options: ['Broken finger', 'Dislocated shoulder', 'Twisted ankle', 'Cut hand'],
    correctIndex: 1,
    funFact:
      'Stephenie was famously the last castaway on a pre-merge tribe and was the first female to return to play in a mixed game of returning and new players.',
  },
  {
    castaway: 'Tiffany Nicole Ervin',
    question: "How many days did Tiffany's tribe go without fire in Season 46?",
    options: ['5 days', '8 days', '11 days', '14 days'],
    correctIndex: 2,
    funFact:
      'Tiffany was voted out with a hidden immunity idol in her pocket and switched careers to art and content creation after a layoff in 2020.',
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
