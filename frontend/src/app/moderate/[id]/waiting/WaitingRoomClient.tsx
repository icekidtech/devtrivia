'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, Play } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Quiz {
  id: string;
  title: string;
  description: string;
  joinCode?: string;
}

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export default function WaitingRoomClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Load quiz data
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${BACKEND}/quizzes/${quizId}`);
        
        if (!res.ok) {
          throw new Error('Failed to load quiz');
        }
        
        const quizData = await res.json();
        setQuiz(quizData);
        setLoading(false);
      } catch {
        setError('Error loading quiz');
        setLoading(false);
      }
    };
    
    // Setup polling for participants
    const pollParticipants = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/quizzes/${quizId}/participants`);
        if (res.ok) {
          const data = await res.json();
          setParticipants(data);
        }
      } catch {
        console.error('Error fetching participants');
      }
    }, 2000);
    
    fetchQuiz();
    
    return () => clearInterval(pollParticipants);
  }, [quizId]);
  
  const handleStartQuiz = async () => {
    try {
      // Update quiz status to "active"
      await fetch(`${BACKEND}/quizzes/${quizId}/start`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Navigate to moderator control panel
      router.push(`/moderate/${quizId}/control`);
    } catch {
      setError('Failed to start quiz');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading waiting room...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-400">{quiz?.title || 'Quiz Waiting Room'}</h1>
        <p className="text-gray-400 mt-1">{quiz?.description}</p>
      </header>
      
      <div className="bg-[#2D2D44] rounded-lg border border-cyan-400/20 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="mr-2 text-cyan-400" />
            <h2 className="text-xl font-semibold">Participants ({participants.length})</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-400">
              <Clock size={18} className="mr-1" />
              <span>Join code: <span className="font-mono text-cyan-400">{quiz?.joinCode}</span></span>
            </div>
            
            <button
              onClick={handleStartQuiz}
              disabled={participants.length === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold ${
                participants.length === 0
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <Play size={18} />
              Start Quiz
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {participants.length > 0 ? (
            participants.map((participant) => (
              <div 
                key={participant.id}
                className="bg-slate-800/50 p-3 rounded-md flex items-center"
              >
                <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 border border-cyan-400/60 flex items-center justify-center font-bold mr-3">
                  {participant.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-xs text-gray-400">{new Date(participant.joinedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>No participants yet. Share the join code to get started!</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}