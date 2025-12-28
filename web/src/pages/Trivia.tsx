import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

// ============================================================================
// TRIVIA DATA
// ============================================================================

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  funFact: string;
  castaway: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
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
    castaway: 'Cirie Fields',
    question: 'Cirie Fields was eliminated in Game Changers (S34) in an unprecedented way. How?',
    options: [
      'Lost firemaking challenge',
      'Medical evacuation',
      'Everyone else had immunity (idol/advantage default)',
      'Rock draw',
    ],
    correctIndex: 2,
    funFact:
      'With 6 players left, idols and advantages left Cirie as the only person who could go home - without receiving a single vote',
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
    castaway: 'Cirie Fields',
    question:
      "Which Survivor 50 contestant convinced Erik Reichenbach to give up individual immunity in one of the show's most iconic moves?",
    options: ['Aubry Bracco', 'Stephenie LaGrossa', 'Cirie Fields', 'Angelina Keeley'],
    correctIndex: 2,
    funFact:
      "The Black Widow Brigade's manipulation of Erik in Micronesia is considered one of Survivor's greatest moves",
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

const WRONG_MESSAGES = [
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

// ============================================================================
// ANIMATED TORCH COMPONENT
// ============================================================================

function AnimatedTorch({
  size = 'large',
  lit = true,
}: {
  size?: 'small' | 'large';
  lit?: boolean;
}) {
  const dimensions = size === 'large' ? { width: 80, height: 180 } : { width: 32, height: 72 };
  const scale = size === 'large' ? 1 : 0.4;

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow effect */}
      {lit && (
        <div
          className="absolute -top-8 w-32 h-40 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255, 147, 41, 0.6) 0%, rgba(255, 87, 34, 0.3) 40%, transparent 70%)',
            animation: 'glowPulse 2s ease-in-out infinite alternate',
            transform: `scale(${scale})`,
          }}
        />
      )}

      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 80 180"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="torchHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="30%" stopColor="#8D6E63" />
            <stop offset="70%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#4E342E" />
          </linearGradient>
          <linearGradient id="torchBowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="50%" stopColor="#C9A050" />
            <stop offset="100%" stopColor="#8D6E63" />
          </linearGradient>
          <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Torch handle */}
        <rect x="35" y="90" width="10" height="85" rx="2" fill="url(#torchHandleGrad)" />

        {/* Torch bowl/cup */}
        <ellipse cx="40" cy="90" rx="18" ry="8" fill="url(#torchBowlGrad)" />
        <path d="M22 90 Q22 75 40 75 Q58 75 58 90" fill="url(#torchBowlGrad)" />

        {/* Flame layers - only show if lit */}
        {lit && (
          <g filter="url(#flameGlow)" style={{ transformOrigin: '40px 75px' }}>
            {/* Outer flame - deep red */}
            <path
              d="M40 10 C55 25, 65 45, 60 65 C55 80, 48 88, 40 90 C32 88, 25 80, 20 65 C15 45, 25 25, 40 10"
              fill="#B22222"
              style={{ animation: 'flameOuter 0.6s ease-in-out infinite alternate' }}
            />
            {/* Middle flame - orange */}
            <path
              d="M40 18 C52 30, 58 48, 54 65 C50 78, 45 85, 40 87 C35 85, 30 78, 26 65 C22 48, 28 30, 40 18"
              fill="#ED8936"
              style={{ animation: 'flameMid 0.5s ease-in-out infinite alternate' }}
            />
            {/* Inner flame - yellow */}
            <path
              d="M40 28 C48 38, 52 52, 48 67 C45 77, 42 83, 40 84 C38 83, 35 77, 32 67 C28 52, 32 38, 40 28"
              fill="#F6E05E"
              style={{ animation: 'flameInner 0.45s ease-in-out infinite alternate' }}
            />
            {/* Core - white/light yellow */}
            <path
              d="M40 40 C45 48, 47 58, 45 70 C43 78, 41 82, 40 82 C39 82, 37 78, 35 70 C33 58, 35 48, 40 40"
              fill="#FFFACD"
              style={{ animation: 'flameCore 0.4s ease-in-out infinite alternate' }}
            />
          </g>
        )}

        {/* Smoke for unlit torch */}
        {!lit && (
          <g className="animate-pulse opacity-30">
            <path d="M40 70 Q42 60 40 50 Q38 40 42 30" stroke="#666" strokeWidth="2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// MINI TORCH FOR PROGRESS TRACKER
// ============================================================================

function MiniTorchIcon({
  lit,
  snuffed,
  pulsing,
}: {
  lit: boolean;
  snuffed?: boolean;
  pulsing?: boolean;
}) {
  return (
    <div className={`relative transition-all duration-500 ${pulsing ? 'animate-pulse' : ''}`}>
      <svg width="28" height="48" viewBox="0 0 28 48" className="relative">
        {/* Handle */}
        <rect x="11" y="28" width="6" height="18" rx="1" fill={snuffed ? '#444' : '#6D4C41'} />

        {/* Bowl */}
        <ellipse cx="14" cy="28" rx="8" ry="3" fill={snuffed ? '#555' : '#C9A050'} />

        {/* Flame or smoke */}
        {lit && !snuffed && (
          <g style={{ transformOrigin: '14px 28px' }}>
            <path
              d="M14 4 C20 10, 24 16, 22 24 C20 28, 17 30, 14 30 C11 30, 8 28, 6 24 C4 16, 8 10, 14 4"
              fill="#ED8936"
              style={{ animation: 'flameOuter 0.5s ease-in-out infinite alternate' }}
            />
            <path
              d="M14 10 C18 14, 20 20, 18 26 C17 28, 15 29, 14 29 C13 29, 11 28, 10 26 C8 20, 10 14, 14 10"
              fill="#F6E05E"
              style={{ animation: 'flameInner 0.4s ease-in-out infinite alternate' }}
            />
          </g>
        )}

        {/* Snuffed smoke */}
        {snuffed && (
          <g className="animate-pulse">
            <path
              d="M14 24 Q16 18 14 12 Q12 6 16 2"
              stroke="#666"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
          </g>
        )}
      </svg>

      {/* Glow for lit torch */}
      {lit && !snuffed && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full blur-md"
          style={{
            background: 'radial-gradient(circle, rgba(255,147,41,0.5) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// TRIVIA CARD COMPONENT
// ============================================================================

interface TriviaCardProps {
  question: TriviaQuestion;
  questionNumber: number;
  onAnswer: (correct: boolean) => void;
  showResult: 'correct' | 'wrong' | null;
  funFact: string | null;
}

function TriviaCard({ question, questionNumber, onAnswer, showResult, funFact }: TriviaCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wrongMessage] = useState(
    () => WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
  );

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedAnswer === question.correctIndex;
    onAnswer(isCorrect);
  };

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }, [question]);

  return (
    <div
      className={`relative transition-all duration-500 ${showResult === 'wrong' ? 'animate-burn' : ''}`}
    >
      {/* Card */}
      <div
        className={`
          relative max-w-xl mx-auto p-8 rounded-lg transform rotate-1
          transition-all duration-500
          ${showResult === 'correct' ? 'ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : ''}
          ${showResult === 'wrong' ? 'opacity-0 scale-95' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, #F4ECD8 0%, #E8DCC8 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        {/* Burnt edge texture overlay */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at top left, transparent 85%, rgba(139,69,19,0.3) 100%), radial-gradient(ellipse at bottom right, transparent 85%, rgba(139,69,19,0.3) 100%)',
          }}
        />

        {/* Question number */}
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-amber-800/60 tracking-widest uppercase">
            Question {questionNumber} of {TRIVIA_QUESTIONS.length}
          </span>
          <p className="text-xs text-amber-600 mt-1">Featuring: {question.castaway}</p>
        </div>

        {/* Question text */}
        <h3 className="font-display text-lg md:text-xl text-neutral-800 text-center mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Answer options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isSubmitted && setSelectedAnswer(index)}
              disabled={isSubmitted}
              className={`
                w-full p-4 rounded-lg text-left transition-all duration-200
                flex items-center gap-4 group
                ${
                  selectedAnswer === index
                    ? 'bg-amber-800/20 border-2 border-amber-800'
                    : 'bg-white/50 border-2 border-transparent hover:bg-white/70 hover:border-amber-800/30'
                }
                ${isSubmitted && index === question.correctIndex ? 'bg-emerald-500/20 border-emerald-500' : ''}
                ${isSubmitted && selectedAnswer === index && index !== question.correctIndex ? 'bg-red-500/20 border-red-500' : ''}
                disabled:cursor-default
              `}
            >
              <span
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-200
                ${
                  selectedAnswer === index
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-800/10 text-amber-800 group-hover:bg-amber-800/20'
                }
              `}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-neutral-700 font-medium">{option}</span>

              {/* Checkmark for correct */}
              {isSubmitted && index === question.correctIndex && (
                <span className="ml-auto text-emerald-600 text-xl">✓</span>
              )}

              {/* X for wrong */}
              {isSubmitted && selectedAnswer === index && index !== question.correctIndex && (
                <span className="ml-auto text-red-600 text-xl">✗</span>
              )}
            </button>
          ))}
        </div>

        {/* Submit button */}
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={`
              w-full py-4 rounded-lg font-display font-semibold text-lg
              transition-all duration-200
              ${
                selectedAnswer !== null
                  ? 'bg-amber-800 text-white hover:bg-amber-900 shadow-lg'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }
            `}
          >
            Submit Answer
          </button>
        )}

        {/* Fun fact for correct answers */}
        {showResult === 'correct' && funFact && (
          <div className="mt-6 p-4 bg-amber-100/50 rounded-lg border border-amber-300/50">
            <p className="text-amber-900 text-sm">
              <span className="font-semibold">🔥 Fun Fact:</span> {funFact}
            </p>
          </div>
        )}
      </div>

      {/* Wrong answer overlay */}
      {showResult === 'wrong' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <p className="font-display text-3xl md:text-4xl text-orange-400 font-bold mb-2 text-shadow-fire">
              {wrongMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS TRACKER
// ============================================================================

function ProgressTracker({
  answers,
  currentQuestion,
}: {
  answers: (boolean | null)[];
  currentQuestion: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
      {answers.map((answer, index) => (
        <MiniTorchIcon
          key={index}
          lit={answer === true || (answer === null && index <= currentQuestion)}
          snuffed={answer === false}
          pulsing={index === currentQuestion && answer === null}
        />
      ))}
    </div>
  );
}

// ============================================================================
// COUNTDOWN TIMER
// ============================================================================

function CountdownTimer() {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date('2026-02-25T15:00:00-08:00').getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 tabular-nums">
          {timeLeft.days}
        </div>
        <div className="text-xs tracking-widest uppercase text-neutral-500 mt-1">Days</div>
      </div>
      <span className="text-2xl text-burgundy-500/30">:</span>
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 tabular-nums">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-xs tracking-widest uppercase text-neutral-500 mt-1">Hours</div>
      </div>
      <span className="text-2xl text-burgundy-500/30">:</span>
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 tabular-nums">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-xs tracking-widest uppercase text-neutral-500 mt-1">Minutes</div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TRIVIA PAGE
// ============================================================================

export function Trivia() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    Array(TRIVIA_QUESTIONS.length).fill(null)
  );
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const triviaRef = useRef<HTMLDivElement>(null);

  const totalQuestions = TRIVIA_QUESTIONS.length;
  const lastQuestionIndex = totalQuestions - 1;

  // Handle scroll for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle answer submission
  const handleAnswer = (correct: boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = correct;
    setAnswers(newAnswers);

    if (correct) {
      setShowResult('correct');
      setFunFact(TRIVIA_QUESTIONS[currentQuestion].funFact);

      // Move to next question after delay
      setTimeout(() => {
        if (currentQuestion < lastQuestionIndex) {
          setCurrentQuestion((prev) => prev + 1);
          setShowResult(null);
          setFunFact(null);
        } else {
          setGameComplete(true);
        }
      }, 3000);
    } else {
      setShowResult('wrong');

      // Move to next question after burn animation
      setTimeout(() => {
        if (currentQuestion < lastQuestionIndex) {
          setCurrentQuestion((prev) => prev + 1);
          setShowResult(null);
        } else {
          setGameComplete(true);
        }
      }, 2000);
    }
  };

  // Calculate score
  const score = answers.filter((a) => a === true).length;
  const isPerfect = score === totalQuestions;

  // Reset game
  const resetGame = () => {
    setCurrentQuestion(0);
    setAnswers(Array(totalQuestions).fill(null));
    setShowResult(null);
    setFunFact(null);
    setGameComplete(false);
  };

  // Scroll to trivia section
  const scrollToTrivia = () => {
    triviaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ================================================================== */}
      {/* SECTION 1: HERO WITH PARALLAX */}
      {/* ================================================================== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 parallax-layer"
          style={{
            background: 'linear-gradient(180deg, #F5F0E8 0%, #E8E0D5 100%)',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="Survivor Fantasy" className="w-12 h-12" />
            <span className="font-display text-2xl font-semibold text-neutral-800">
              Survivor Fantasy
            </span>
          </div>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">
              Registration Open for Season 50
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-neutral-900 leading-tight mb-6">
            Fantasy Survivor
            <br />
            for People Who
            <br />
            <span className="italic text-burgundy-500">Actually</span> Watch
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-neutral-600 max-w-xl mx-auto mb-10 leading-relaxed">
            100+ scoring rules. Real strategy. No luck required. Draft your castaways, make weekly
            picks, and prove you know Survivor better than anyone.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="px-8 py-4 bg-burgundy-500 text-white font-display font-semibold rounded-lg hover:bg-burgundy-600 transition-all shadow-lg shadow-burgundy-500/25 flex items-center gap-2"
            >
              Join Season 50
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <button
              onClick={scrollToTrivia}
              className="px-8 py-4 bg-white text-neutral-700 font-display font-medium rounded-lg border border-neutral-200 hover:border-burgundy-500 hover:text-burgundy-500 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={scrollToTrivia}
            className="flex flex-col items-center gap-2 text-neutral-400 hover:text-burgundy-500 transition-colors"
          >
            <span className="text-sm font-medium">Scroll to test your knowledge</span>
            <svg
              className="w-6 h-6 scroll-indicator"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 2: TORCH TRIVIA GAME */}
      {/* ================================================================== */}
      <section
        ref={triviaRef}
        className="relative min-h-screen py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0d1f0d 50%, #1a1a1a 100%)',
        }}
      >
        {/* Ambient jungle glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(34, 139, 34, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Torch at top */}
        <div className="relative z-10 flex justify-center mb-12">
          <AnimatedTorch size="large" lit={!gameComplete || isPerfect} />
        </div>

        {/* Section header */}
        <div className="relative z-10 text-center mb-12">
          <h2
            className="font-display text-3xl md:text-4xl font-bold tracking-widest uppercase"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 165, 0, 0.5)',
            }}
          >
            🔥 ARE YOU A TRUE SURVIVOR FAN? 🔥
          </h2>
          <p className="text-amber-200/70 mt-2">
            {totalQuestions} Questions • One for each castaway
          </p>
        </div>

        {/* Game content */}
        <div className="relative z-10 container mx-auto px-4">
          {!gameComplete ? (
            <>
              {/* Trivia card */}
              <TriviaCard
                question={TRIVIA_QUESTIONS[currentQuestion]}
                questionNumber={currentQuestion + 1}
                onAnswer={handleAnswer}
                showResult={showResult}
                funFact={funFact}
              />

              {/* Progress tracker */}
              <div className="mt-12">
                <ProgressTracker answers={answers} currentQuestion={currentQuestion} />

                {/* Streak counter */}
                <div className="text-center mt-6">
                  <p className="text-orange-400 font-display text-lg">
                    🔥 STREAK: {score}/{currentQuestion + (showResult ? 1 : 0)} | Can you go{' '}
                    {totalQuestions} for {totalQuestions}?
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* End state */
            <div className="text-center max-w-xl mx-auto">
              {isPerfect ? (
                <>
                  {/* Perfect score celebration */}
                  <div className="relative mb-8">
                    <div className="text-8xl mb-4">👑</div>
                    <h3
                      className="font-display text-4xl md:text-5xl font-bold"
                      style={{
                        background: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      SOLE SURVIVOR OF TRIVIA!
                    </h3>
                    <p className="text-xl text-amber-200 mt-2">
                      Perfect {totalQuestions}/{totalQuestions}!
                    </p>
                  </div>
                  <p className="text-xl text-neutral-300 mb-8">
                    You truly know your Survivor. Now prove it in fantasy.
                  </p>
                  <Link
                    to={user ? '/dashboard' : '/signup'}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
                  >
                    Join Season 50 and Dominate
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  {/* Regular completion */}
                  <div className="mb-8">
                    <div className="text-6xl mb-4">
                      {score >= 20 ? '🔥' : score >= 12 ? '⚔️' : '📺'}
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                      {score >= 20 ? 'Impressive!' : score >= 12 ? 'Not Bad!' : 'Time to Rewatch'}
                    </h3>
                    <p className="text-xl text-amber-200 mb-2">
                      {score}/{totalQuestions} Correct
                    </p>
                    <p className="text-lg text-neutral-400">
                      {score >= 20
                        ? "You're merge-worthy. Ready to dominate fantasy?"
                        : score >= 12
                          ? "You might get blindsided, but you've got potential."
                          : 'Hit up Paramount+ and study up before Season 50!'}
                    </p>
                  </div>

                  {/* Progress display */}
                  <div className="mb-8">
                    <ProgressTracker answers={answers} currentQuestion={totalQuestions} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={resetGame}
                      className="px-8 py-4 bg-white/10 text-white font-display font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                    >
                      Try Again
                    </button>
                    <Link
                      to={user ? '/dashboard' : '/signup'}
                      className="px-8 py-4 bg-burgundy-500 text-white font-display font-semibold rounded-lg hover:bg-burgundy-600 transition-all shadow-lg flex items-center gap-2"
                    >
                      Join Season 50 Anyway
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 3: FINAL CTA */}
      {/* ================================================================== */}
      <section
        className="relative py-32 md:py-40 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #E8E0D5 0%, #F5F0E8 100%)',
        }}
      >
        {/* Decorative torches */}
        <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 opacity-30">
          <AnimatedTorch size="small" />
        </div>
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 opacity-30">
          <AnimatedTorch size="small" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center max-w-2xl">
          {/* Main headline */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
            So, are you a <span className="text-burgundy-500">TRUE</span> Survivor fan?
          </h2>

          <p className="text-xl text-neutral-600 mb-10 leading-relaxed">
            You've proven you know the game.
            <br />
            Now it's time to play it.
          </p>

          {/* CTA */}
          <Link
            to={user ? '/dashboard' : '/signup'}
            className="inline-flex items-center gap-2 px-10 py-5 bg-burgundy-500 text-white font-display text-lg font-bold rounded-lg hover:bg-burgundy-600 transition-all shadow-xl shadow-burgundy-500/30"
          >
            Join Us for Season 50
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          {/* Season info */}
          <div className="mt-12">
            <p className="text-neutral-500 mb-4">Season 50 premieres February 26, 2026</p>
            <p className="text-sm text-neutral-400 mb-4">Registration closes:</p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CUSTOM STYLES */}
      {/* ================================================================== */}
      <style>{`
        @keyframes glowPulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes flameOuter {
          0% { transform: scaleY(1) scaleX(1); }
          100% { transform: scaleY(1.08) scaleX(0.95); }
        }
        
        @keyframes flameMid {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(1.1) translateY(-2px); }
        }
        
        @keyframes flameInner {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(1.12); }
        }
        
        @keyframes flameCore {
          0% { transform: scaleY(1) scaleX(1); }
          100% { transform: scaleY(1.15) scaleX(0.9); }
        }
        
        @keyframes burn {
          0% { 
            opacity: 1; 
            transform: scale(1) rotate(1deg);
            filter: brightness(1);
          }
          30% {
            filter: brightness(1.5) sepia(1) saturate(3);
          }
          60% {
            opacity: 0.5;
            transform: scale(0.95) rotate(-1deg);
            filter: brightness(0.5) sepia(1);
          }
          100% { 
            opacity: 0; 
            transform: scale(0.9) rotate(2deg) translateY(20px);
            filter: brightness(0);
          }
        }
        
        .animate-burn {
          animation: burn 1.5s ease-out forwards;
        }
        
        .text-shadow-fire {
          text-shadow: 0 0 20px rgba(255, 165, 0, 0.8), 0 0 40px rgba(255, 87, 34, 0.6);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Trivia;
// Trigger deploy Sun Dec 28 05:13:59 PST 2025
