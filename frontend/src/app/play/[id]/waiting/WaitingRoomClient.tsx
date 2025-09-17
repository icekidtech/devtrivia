'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { User, Quiz } from '@/types';

interface Participant {
  userId: string;
  name: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function WaitingRoomClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load user and check quiz status
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login?redirect=/play/' + quizId + '/waiting');
          return;
        }
        
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Fetch quiz data
        const res = await fetch(`${BACKEND}/quizzes/${quizId}`);
        if (!res.ok) {
          throw new Error(`Quiz not found or not available (${res.status})`);
        }
        
        const quizData = await res.json();
        
        // Check if quiz is published
        if (!quizData.published) {
          throw new Error('This quiz is not currently available');
        }
        
        setQuiz(quizData);
        setIsLoading(false);
        
        // Register as participant
        if (userData && userData.id) {
          await fetch(`${BACKEND}/quizzes/${quizId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: userData.id,
              name: userData.name
            }),
          });
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the quiz');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [quizId, router]);
  
  // Poll for participants and quiz status
  useEffect(() => {
    if (isLoading || error || !quiz) return;
    
    const pollInterval = setInterval(async () => {
      try {
        // Check for participants
        const participantsRes = await fetch(`${BACKEND}/quizzes/${quizId}/participants`);
        if (participantsRes.ok) {
          const data = await participantsRes.json();
          setParticipants(data);
        }
        
        // Check if quiz has started
        const quizRes = await fetch(`${BACKEND}/quizzes/${quizId}/status`);
        if (quizRes.ok) {
          const status = await quizRes.json();
          if (status.active) {
            router.push(`/play/${quizId}`);
          }
        }
      } catch (err) {
        console.error('Error polling data:', err);
      }
    }, 3000);
    
    return () => clearInterval(pollInterval);
  }, [isLoading, error, quiz, quizId, router]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Joining quiz room...</div>
      </div>
    );
  }
  
  // Show error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 px-4">
        <div className="text-red-400 mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">{quiz?.title}</h1>
          <p className="text-gray-400">{quiz?.description}</p>
        </div>
        
        <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Users className="mr-2 text-cyan-400" />
              <h2 className="text-xl font-semibold">Waiting Room</h2>
            </div>
            
            <div className="flex items-center text-amber-400 animate-pulse">
              <Clock size={18} className="mr-2" />
              <span>Waiting for moderator to start...</span>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">You&apos;ve joined as:</p>
            <div className="bg-slate-800/50 p-3 rounded-md flex items-center">
              <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 border border-cyan-400/60 flex items-center justify-center font-bold mr-3">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">Ready to play</p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-300 mb-3">Other participants:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {participants.length > 0 ? (
              participants
                .filter(p => p.userId !== user?.id) // Don't show current user
                .map((participant) => (
                  <div 
                    key={participant.userId}
                    className="bg-slate-800/30 p-3 rounded-md flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-medium mr-2">
                      {participant.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="truncate">
                      <p className="font-medium truncate">{participant.name}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full text-center py-6 text-gray-400">
                <p>You&apos;re the first one here! Waiting for others to join...</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link
            href="/user/dashboard"
            className="bg-slate-700/50 hover:bg-slate-700 text-gray-300 px-6 py-2 rounded-md transition"
          >
            Leave Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}