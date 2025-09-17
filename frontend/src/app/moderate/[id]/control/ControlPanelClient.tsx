'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Award, Clock, Users, CheckCircle, 
  BarChart2
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  correctCount: number;
}

interface Participant {
  id: string;
  name: string;
}

export default function ControlPanelClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participants] = useState<Participant[]>([]);
  const [quizEnded, setQuizEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await fetch(`${BACKEND}/quizzes/${quizId}`);
        
        if (!res.ok) {
          throw new Error('Failed to load quiz');
        }
        
        const quizData = await res.json();
        setQuiz(quizData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowLeaderboard(true);
      
      // Simulate leaderboard data - in real app this would come from WebSocket
      const mockLeaderboard: LeaderboardEntry[] = [
        { userId: '1', userName: 'Player 1', score: 850, correctCount: currentQuestionIndex + 1 },
        { userId: '2', userName: 'Player 2', score: 720, correctCount: currentQuestionIndex },
        { userId: '3', userName: 'Player 3', score: 680, correctCount: currentQuestionIndex },
      ];
      setLeaderboard(mockLeaderboard);
      
      // Hide leaderboard after 5 seconds and show next question
      setTimeout(() => {
        setShowLeaderboard(false);
      }, 5000);
    } else {
      // End quiz
      setQuizEnded(true);
      setShowLeaderboard(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Quiz Not Found</h1>
          <p className="text-gray-400 mb-6">The quiz you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/moderator/dashboard')}
            className="px-6 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold hover:bg-cyan-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">{quiz?.title || 'Quiz Control Panel'}</h1>
          <p className="text-gray-400 mt-1">Question {currentQuestionIndex + 1} of {quiz?.questions?.length}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#2D2D44]/80 px-3 py-1 rounded-md flex items-center">
            <Users size={16} className="mr-2 text-cyan-400" />
            <span>{participants.length} participants</span>
          </div>
        </div>
      </header>

      {!quizEnded && !showLeaderboard && (
        <div className="bg-[#2D2D44] rounded-lg border border-cyan-400/20 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Current Question</h2>
          
          <div className="bg-slate-800/50 p-4 rounded-md mb-6">
            <p className="text-lg">{currentQuestion?.text}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion?.answers?.map((answer: Answer) => (
              <div 
                key={answer.id}
                className={`p-3 rounded-md border ${
                  answer.isCorrect 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600/30 bg-slate-800/30'
                }`}
              >
                <div className="flex items-center">
                  {answer.isCorrect && (
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                  )}
                  <p>{answer.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold hover:bg-cyan-500"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'End Quiz'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
      
      {showLeaderboard && (
        <div className="bg-[#2D2D44] rounded-lg border border-cyan-400/20 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <BarChart2 className="mr-2 text-cyan-400" />
              {quizEnded ? 'Final Leaderboard' : 'Current Standings'}
            </h2>
            
            {!quizEnded && (
              <div className="text-sm text-gray-400 flex items-center">
                <Clock size={16} className="mr-1" />
                <span>Next question in a few seconds...</span>
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-cyan-400/20">
                  <th className="pb-2 w-16">Rank</th>
                  <th className="pb-2">Participant</th>
                  <th className="pb-2 text-right">Points</th>
                  <th className="pb-2 text-right">Correct</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <tr 
                    key={entry.userId}
                    className={`border-b border-gray-600/30 ${
                      index < 3 ? 'bg-gradient-to-r from-transparent' : ''
                    } ${
                      index === 0 ? 'to-amber-500/10' :
                      index === 1 ? 'to-gray-400/10' :
                      index === 2 ? 'to-orange-600/10' : ''
                    }`}
                  >
                    <td className="py-3 font-bold">
                      {index === 0 && <Award className="inline mr-1 text-amber-400" />}
                      {index === 1 && <Award className="inline mr-1 text-gray-400" />}
                      {index === 2 && <Award className="inline mr-1 text-orange-600" />}
                      {index + 1}
                    </td>
                    <td className="py-3">{entry.userName}</td>
                    <td className="py-3 text-right font-mono text-cyan-400">{entry.score}</td>
                    <td className="py-3 text-right">{entry.correctCount}/{currentQuestionIndex + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {quizEnded && (
            <div className="mt-8 flex justify-between">
              <div className="text-yellow-400 flex items-center">
                <Award className="mr-2" />
                <span>Awards have been distributed to top performers!</span>
              </div>
              
              <button
                onClick={() => router.push('/moderator/dashboard')}
                className="px-6 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold hover:bg-cyan-500"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}