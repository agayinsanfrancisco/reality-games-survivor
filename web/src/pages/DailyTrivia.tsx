/**
 * Daily Trivia Page - One question per day, account required
 * Conversion-focused: Hook to get users to join leagues
 */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { apiWithAuth } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import {
  TriviaHeader,
  TriviaStatsCard,
  TriviaQuestionCard,
  TriviaConversionCTA,
} from '@/components/trivia';

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  castaway_name: string | null;
}

interface TriviaResponse {
  question: TriviaQuestion;
  alreadyAnswered: boolean;
  userAnswer: {
    selectedIndex: number;
    isCorrect: boolean;
    answeredAt: string;
  } | null;
  correctIndex: number;
  funFact: string | null;
}

interface TriviaStats {
  total_answered: number;
  total_correct: number;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
}

export function DailyTrivia() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [funFact, setFunFact] = useState<string | null>(null);

  // Fetch today's question
  const { data: triviaData, isLoading: questionLoading } = useQuery<TriviaResponse>({
    queryKey: ['trivia', 'today'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const result = await apiWithAuth<TriviaResponse>('/trivia/today', session.access_token);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch user stats
  const { data: stats } = useQuery<TriviaStats>({
    queryKey: ['trivia', 'stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const result = await apiWithAuth<TriviaStats>('/trivia/stats', session.access_token);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    enabled: !!user,
  });

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async (selectedIndex: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const result = await apiWithAuth<{ isCorrect: boolean; correctIndex: number; funFact: string }>(
        '/trivia/answer',
        session.access_token,
        {
          method: 'POST',
          body: JSON.stringify({
            questionId: triviaData?.question.id,
            selectedIndex,
          }),
        }
      );
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (data) => {
      setIsCorrect(data.isCorrect);
      setFunFact(data.funFact);
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ['trivia', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['trivia', 'stats'] });
    },
  });

  const handleAnswer = (index: number) => {
    if (triviaData?.alreadyAnswered || showResult) return;
    setSelectedIndex(index);
    submitAnswer.mutate(index);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TriviaHeader
          title="Daily Trivia"
          subtitle="Test your Survivor knowledge - one question per day!"
        />

        {stats && (
          <div className="mb-8">
            <TriviaStatsCard stats={stats} />
          </div>
        )}

        <TriviaQuestionCard
          question={question}
          selectedIndex={selectedIndex}
          showResult={showResult}
          isCorrect={isCorrect}
          funFact={funFact || triviaData?.funFact || null}
          alreadyAnswered={alreadyAnswered}
          userAnswer={userAnswer}
          correctIndex={submitAnswer.data?.correctIndex ?? triviaData?.correctIndex ?? -1}
          isSubmitting={submitAnswer.isPending}
          onAnswer={handleAnswer}
        />

        <TriviaConversionCTA />
      </main>

      <Footer />
    </div>
  );
}

export default DailyTrivia;
