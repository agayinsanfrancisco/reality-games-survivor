/**
 * Trivia Page - 24 Questions with 24h Lockout
 * Account required
 * 
 * Rules:
 * - Answer all 24 questions in one day if you can
 * - 20 seconds per question or timeout
 * - Get one wrong = locked out for 24 hours
 * - Come back the next day to continue
 * - Leaderboard tracks days to complete all 24
 */
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Loader2, Check, X, Flame, Trophy, Clock, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { apiWithAuth } from '@/lib/api';
import { formatDate } from '@/lib/date-utils';

interface TriviaQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: string[];
}

interface TriviaResponse {
  question: TriviaQuestion | null;
  progress: {
    totalQuestions: number;
    questionsAnswered: number;
    questionsCorrect: number;
  };
  alreadyAnswered: boolean;
  userAnswer: {
    selectedIndex: number;
    isCorrect: boolean;
    answeredAt: string;
    correctIndex: number;
  } | null;
  funFact: string | null;
  isLocked: boolean;
  lockedUntil: string | null;
  isComplete: boolean;
  daysToComplete: number | null;
}

interface ProgressData {
  totalQuestions: number;
  questionsAnswered: number;
  questionsCorrect: number;
  isLocked: boolean;
  lockedUntil: string | null;
  isComplete: boolean;
  daysToComplete: number | null;
}

const WRONG_MESSAGES = [
  "It's time for you to go.",
  "The Tribe Has Spoken.",
  "Your torch has been snuffed.",
  "Time for you to go.",
  "Blindsided!",
  "That's a vote against you.",
  "You've been voted out of the trivia.",
  "Grab your torch and head out.",
  "You didn't have the numbers.",
  "Should've played your idol.",
  "The jury saw right through that.",
  "Outplayed. Outwitted. Outlasted... by this quiz.",
  "Drop your buff.",
  "The tribe has spoken... and they said no.",
  "Not immunity-worthy.",
];

export function Trivia() {
  const { user, loading: authLoading, session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [wrongMessage, setWrongMessage] = useState<string>("It's time for you to go.");

  // Fetch next question and progress
  const { data: triviaData, isLoading: questionLoading, refetch: refetchQuestion } = useQuery<TriviaResponse>({
    queryKey: ['trivia', 'next'],
    queryFn: async () => {
      if (!session?.access_token) throw new Error('Not authenticated');
      const response = await apiWithAuth<{ data: TriviaResponse }>('/trivia/next', session.access_token);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    enabled: !!user && !!session?.access_token,
    retry: false,
  });

  // Fetch progress separately
  const { data: progress } = useQuery<ProgressData>({
    queryKey: ['trivia', 'progress'],
    queryFn: async () => {
      if (!session?.access_token) throw new Error('Not authenticated');
      const response = await apiWithAuth<{ data: ProgressData }>('/trivia/progress', session.access_token);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    enabled: !!user && !!session?.access_token,
    refetchInterval: 60000, // Refetch every minute to check lockout status
  });

  // Timer countdown (20 seconds per question)
  useEffect(() => {
    if (!triviaData?.question || triviaData.alreadyAnswered || showResult || isTimedOut || triviaData.isLocked) {
      return;
    }

    if (timeRemaining <= 0) {
      setIsTimedOut(true);
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimedOut(true);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, triviaData, showResult, isTimedOut]);

  // Reset timer when new question loads
  useEffect(() => {
    if (triviaData?.question && !triviaData.alreadyAnswered && !triviaData.isLocked) {
      setTimeRemaining(20);
      setIsTimedOut(false);
      setShowResult(false);
      setSelectedIndex(null);
      setFunFact(null);
    }
  }, [triviaData?.question?.id]);

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async (selectedIndex: number) => {
      if (!session?.access_token) throw new Error('Not authenticated');
      if (!triviaData?.question) throw new Error('No question available');

      const response = await apiWithAuth<{ data: { isCorrect: boolean; correctIndex: number; funFact: string | null; isLocked: boolean; lockedUntil: string | null } }>(
        '/trivia/answer',
        session.access_token,
        {
          method: 'POST',
          body: JSON.stringify({
            questionId: triviaData.question.id,
            selectedIndex,
          }),
        }
      );
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: (data) => {
      setIsCorrect(data.isCorrect);
      setFunFact(data.funFact || null);
      setShowResult(true);
      
      // Set random wrong message if incorrect
      if (!data.isCorrect) {
        setWrongMessage(WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);
      }
      
      // Invalidate queries to refetch next question
      queryClient.invalidateQueries({ queryKey: ['trivia', 'next'] });
      queryClient.invalidateQueries({ queryKey: ['trivia', 'progress'] });
    },
  });

  const handleTimeout = () => {
    if (triviaData?.question && !triviaData.alreadyAnswered && !showResult) {
      setWrongMessage(WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);
      submitAnswer.mutate(-1); // -1 indicates timeout
    }
  };

  const handleAnswer = (index: number) => {
    if (triviaData?.alreadyAnswered || showResult || isTimedOut || triviaData?.isLocked) return;
    setSelectedIndex(index);
    submitAnswer.mutate(index);
  };

  // Auto-advance to next question after showing result
  useEffect(() => {
    if (showResult && !triviaData?.isLocked && isCorrect) {
      const timer = setTimeout(() => {
        refetchQuestion();
        setShowResult(false);
        setSelectedIndex(null);
        setIsTimedOut(false);
        setTimeRemaining(20);
      }, 3000); // Show result for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showResult, triviaData?.isLocked, isCorrect, refetchQuestion]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" state={{ from: '/trivia' }} replace />;
  }

  if (authLoading || questionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-burgundy-500 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const question = triviaData?.question;
  const alreadyAnswered = triviaData?.alreadyAnswered;
  const userAnswer = triviaData?.userAnswer;
  const isLocked = triviaData?.isLocked || progress?.isLocked;
  const lockedUntil = triviaData?.lockedUntil || progress?.lockedUntil;
  const isComplete = triviaData?.isComplete || progress?.isComplete;

  // Calculate lockout time remaining
  const getLockoutTimeRemaining = () => {
    if (!lockedUntil) return null;
    const now = new Date();
    const lockout = new Date(lockedUntil);
    const diff = lockout.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section - Explains Rules */}
        {!isLocked && !isComplete && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Flame className="h-12 w-12 text-burgundy-500" />
              <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-800">
                Survivor Trivia Challenge
              </h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-card p-8 border-2 border-burgundy-200 mb-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-burgundy-600 mb-6">
                How It Works
              </h2>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-burgundy-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">Answer All 24 Questions</p>
                    <p className="text-neutral-600 text-sm">
                      You can answer all 24 questions in one day if you get them all right. Prove you're a true Survivor fan!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">20 Seconds Per Question</p>
                    <p className="text-neutral-600 text-sm">
                      Each question has a 20-second timer. Time runs out? That counts as wrong.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Lock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">Get One Wrong? <span className="text-red-600">It's Time For You To Go</span></p>
                    <p className="text-neutral-600 text-sm">
                      Miss a question or run out of time? You're locked out for 24 hours. Come back tomorrow to continue.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Trophy className="h-4 w-4 text-burgundy-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">Leaderboard Tracks Your Progress</p>
                    <p className="text-neutral-600 text-sm">
                      See how many days it took you to complete all 24 questions. Fastest completion wins!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress && !isComplete && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-600">
                Progress: {progress.questionsAnswered} / {progress.totalQuestions} questions
              </span>
              <span className="text-sm font-medium text-burgundy-600">
                Correct: {progress.questionsCorrect}
              </span>
            </div>
            <div className="w-full bg-cream-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-burgundy-500 to-red-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(progress.questionsAnswered / progress.totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Lockout Message - Simple "Time For You To Go" */}
        {isLocked && lockedUntil && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-400 rounded-2xl p-8 mb-8 text-center shadow-lg">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-4xl font-display font-bold text-red-800 mb-4">
              It's Time For You To Go
            </h2>
            <p className="text-xl text-red-700 mb-2 font-semibold">
              The tribe has spoken.
            </p>
            <p className="text-lg text-red-600 mb-6">
              You got a question wrong. Come back in <strong className="text-2xl">{getLockoutTimeRemaining() || '24 hours'}</strong> to continue.
            </p>
            <p className="text-sm text-red-500 mb-6">
              Lockout expires: {formatDate(lockedUntil)}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy-600 text-white font-bold rounded-xl hover:bg-burgundy-700 transition-colors shadow-md text-lg"
            >
              Join a League While You Wait
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && progress?.daysToComplete && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 mb-8 text-center">
            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold text-green-800 mb-2">
              Congratulations! You Completed All 24 Questions!
            </h3>
            <p className="text-green-700 text-lg mb-4">
              You finished in <strong>{progress.daysToComplete} day{progress.daysToComplete !== 1 ? 's' : ''}</strong>
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              Join a League Now
            </Link>
          </div>
        )}

        {/* Question Card */}
        {!isLocked && !isComplete && question && (
          <div className="bg-white rounded-2xl shadow-card p-8 border-2 border-burgundy-200">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-neutral-800">
                  Question {question.questionNumber} of {progress?.totalQuestions || 24}
                </h2>
              </div>
              {!alreadyAnswered && !showResult && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-700 text-lg">{timeRemaining}s</span>
                </div>
              )}
            </div>

            <p className="text-2xl font-display font-bold text-neutral-800 mb-6">
              {question.question}
            </p>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => {
                const isSelected = selectedIndex === index || userAnswer?.selectedIndex === index;
                const showCorrect = showResult || alreadyAnswered;
                const isUserAnswer = isSelected;
                const correctIndex = submitAnswer.data?.correctIndex ?? userAnswer?.correctIndex ?? -1;
                const isRightAnswer = showCorrect && index === correctIndex;

                let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all ';
                if (alreadyAnswered) {
                  if (isUserAnswer) {
                    buttonClass += userAnswer.isCorrect
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-50 border-red-300 text-red-800';
                  } else if (isRightAnswer) {
                    buttonClass += 'bg-green-50 border-green-300 text-green-800';
                  } else {
                    buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-600';
                  }
                } else if (showResult) {
                  if (isSelected) {
                    buttonClass += isCorrect
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-50 border-red-300 text-red-800';
                  } else if (isRightAnswer) {
                    buttonClass += 'bg-green-50 border-green-300 text-green-800';
                  } else {
                    buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-600';
                  }
                } else {
                  buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-700 hover:border-burgundy-300 hover:bg-cream-50 cursor-pointer';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={alreadyAnswered || showResult || isTimedOut || submitAnswer.isPending}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult || alreadyAnswered ? (
                        <>
                          {isUserAnswer && (
                            <span className="ml-2">
                              {userAnswer?.isCorrect || isCorrect ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <X className="h-5 w-5 text-red-600" />
                              )}
                            </span>
                          )}
                          {!isUserAnswer && isRightAnswer && (
                            <Check className="h-5 w-5 text-green-600 ml-2" />
                          )}
                        </>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result Message */}
            {(showResult || alreadyAnswered) && (funFact || triviaData?.funFact) && (
              <div className={`p-6 rounded-xl mb-6 ${
                (userAnswer?.isCorrect || isCorrect) 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : 'bg-red-50 border-2 border-red-300'
              }`}>
                {isCorrect ? (
                  <>
                    <p className="text-lg font-bold text-green-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">🔥</span> Correct!
                    </p>
                    <p className="text-sm text-neutral-700">{funFact || triviaData?.funFact}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-red-800 mb-3 text-center">
                      💀 {wrongMessage}
                    </p>
                    <p className="text-sm text-red-700 text-center mb-2">
                      Correct answer: <span className="font-semibold">{question.options[correctIndex]}</span>
                    </p>
                    <p className="text-sm text-neutral-700 mb-3">{funFact || triviaData?.funFact}</p>
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-3">
                      <p className="text-sm font-semibold text-red-800 text-center">
                        ⏰ You're locked out for 24 hours. Come back tomorrow to continue.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Timeout Message */}
            {isTimedOut && !showResult && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl mb-6">
                <p className="text-sm font-medium text-yellow-800 text-center">
                  ⏰ Time's up! {wrongMessage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Question Available */}
        {!isLocked && !isComplete && !question && (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-cream-200 text-center">
            <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Questions Available</h3>
            <p className="text-neutral-500">
              Check back later for trivia questions!
            </p>
          </div>
        )}

        {/* Conversion CTA */}
        {!isComplete && (
          <div className="mt-8 bg-gradient-to-r from-burgundy-500 to-red-600 rounded-2xl p-8 text-white text-center shadow-lg">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold mb-2">
              Ready to Play for Real?
            </h3>
            <p className="text-burgundy-100 mb-6 max-w-lg mx-auto">
              Join Season 50 and compete in fantasy leagues. Draft castaways, make weekly picks, and prove you're the ultimate Survivor fan!
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-white text-burgundy-600 font-bold px-8 py-4 rounded-xl hover:bg-cream-100 transition-colors"
            >
              Join a League Now
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Trivia;
