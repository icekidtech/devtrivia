'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  rank?: string;
  questionResults: {
    questionId: string;
    questionText: string;
    selectedAnswerId: string;
    selectedAnswerText: string;
    correctAnswerId: string;
    correctAnswerText: string;
    isCorrect: boolean;
  }[];
}

export default function QuizResultsClient({ resultId }: { resultId: string }) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login');
          return;
        }
        
        const userData = JSON.parse(storedUser);
        
        // Fetch result data
        const res = await fetch(`${BACKEND}/results/${resultId}`, {
          headers: { 
            Authorization: `Bearer ${userData.token}`
          }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch results (${res.status})`);
        }
        
        const resultData = await res.json();
        setResult(resultData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading results:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the results');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [resultId, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading results...</div>
      </div>
    );
  }
  
  // Show error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 px-4">
        <div className="text-red-400 mb-4">{error}</div>
        <Link 
          href="/user/dashboard"
          className="bg-cyan-400/20 text-cyan-400 px-6 py-2 rounded-md hover:bg-cyan-400/30 transition mt-4"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  // Results not found
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 px-4">
        <div className="text-red-400 mb-4">Results not found</div>
        <Link 
          href="/user/dashboard"
          className="bg-cyan-400/20 text-cyan-400 px-6 py-2 rounded-md hover:bg-cyan-400/30 transition mt-4"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link 
          href="/user/dashboard"
          className="inline-flex items-center text-gray-300 hover:text-cyan-400 mb-6"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">
            <span className="text-cyan-400">Quiz Results:</span> {result.quizTitle}
          </h1>
          
          <p className="text-sm text-gray-400 mb-6">
            Completed on {new Date(result.completedAt).toLocaleDateString()} at {new Date(result.completedAt).toLocaleTimeString()}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-cyan-400/10 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Score</p>
              <p className="text-3xl font-bold text-cyan-400">{result.score}%</p>
            </div>
            
            <div className="bg-cyan-400/10 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Correct Answers</p>
              <p className="text-3xl font-bold text-lime-400">{result.correctAnswers}/{result.totalQuestions}</p>
            </div>
            
            <div className="bg-cyan-400/10 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Rank</p>
              <p className="text-3xl font-bold text-fuchsia-500">{result.rank || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg">
          <h2 className="text-xl font-bold mb-6">Detailed Question Review</h2>
          
          <div className="space-y-6">
            {result.questionResults?.map((qResult, index) => (
              <div key={qResult.questionId} className="border-b border-gray-600/30 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start mb-3">
                  <div className={`flex-shrink-0 mt-1 ${qResult.isCorrect ? 'text-lime-400' : 'text-red-400'}`}>
                    {qResult.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium">Question {index + 1}: {qResult.questionText}</h3>
                    
                    <div className="mt-3 space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-400">Your answer: </span>
                        <span className={qResult.isCorrect ? 'text-lime-400' : 'text-red-400'}>
                          {qResult.selectedAnswerText}
                        </span>
                      </div>
                      
                      {!qResult.isCorrect && (
                        <div className="text-sm">
                          <span className="text-gray-400">Correct answer: </span>
                          <span className="text-lime-400">{qResult.correctAnswerText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}