'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Award, Clock, Users, CheckCircle, 
  AlertTriangle, BarChart2
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ControlPanelClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
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
    
    // Poll for real-time updates
    const pollData = setInterval(async () => {
      try {
        // Get participants list
        const participantsRes = await fetch(`${BACKEND}/quizzes/${quizId}/participants`);
        if (participantsRes.ok) {
          const data = await participantsRes.json();
          setParticipants(data);
        }
        
        // Get leaderboard if showing
        if (showLeaderboard) {
          const leaderboardRes = await fetch(`${BACKEND}/quizzes/${quizId}/leaderboard`);
          if (leaderboardRes.ok) {
            const data = await leaderboardRes.json();
            setLeaderboard(data);
          }
        }
      } catch (err) {
        console.error('Error polling data:', err);
      }
    }, 2000);
    
    return () => clearInterval(pollData);
  }, [quizId, showLeaderboard]);
  
  const handleNextQuestion = async () => {
    try {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        // First show leaderboard
        setShowLeaderboard(true);
        
        // Get intermediate leaderboard
        const leaderboardRes = await fetch(`${BACKEND}/quizzes/${quizId}/leaderboard`);
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
        
        // Wait 10 seconds then proceed to next question
        setTimeout(async () => {
          setShowLeaderboard(false);
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          
          // Notify backend to advance to next question
          await fetch(`${BACKEND}/quizzes/${quizId}/next-question`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              questionIndex: currentQuestionIndex + 1 
            }),
          });
        }, 10000);
      } else {
        // This was the last question, end the quiz
        setQuizEnded(true);
        setShowLeaderboard(true);
        
        // Get final leaderboard
        const leaderboardRes = await fetch(`${BACKEND}/quizzes/${quizId}/leaderboard`);
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
        
        // Notify backend that quiz is complete
        await fetch(`${BACKEND}/quizzes/${quizId}/end`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('Error advancing question:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading control panel...</div>
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
            {currentQuestion?.answers?.map((answer: any) => (
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