'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function JoinQuizPage() {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${BACKEND}/quizzes/join/${joinCode}`);
      
      if (!res.ok) {
        throw new Error('Invalid join code or quiz not found');
      }
      
      const quiz = await res.json();
      
      // Store minimal quiz info for the play page
      localStorage.setItem('currentQuiz', JSON.stringify({
        id: quiz.id,
        title: quiz.title,
        joinCode: quiz.joinCode
      }));
      
      // Redirect to the play page
      router.push(`/play/${quiz.id}`);
    } catch (err) {
      console.error('Error joining quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Join a Quiz</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Enter Quiz Code
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code (e.g., AB123C)"
            className="w-full p-3 border border-gray-300 rounded text-center uppercase text-lg tracking-wider"
            maxLength={6}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary text-white p-3 rounded font-medium"
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Quiz'}
        </button>
      </form>
    </div>
  );
}