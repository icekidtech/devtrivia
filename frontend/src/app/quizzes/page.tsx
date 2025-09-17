'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Quiz {
  id: string;
  title: string;
  description: string;
  published: boolean;
  joinCode?: string;
  questions?: any[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`${BACKEND}/quizzes`);
        if (!res.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await res.json();
        // Only show published quizzes
        const publishedQuizzes = data.filter((quiz: Quiz) => quiz.published);
        setQuizzes(publishedQuizzes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 px-4">
        <div className="text-red-400 mb-4">{error}</div>
        <Link 
          href="/"
          className="bg-cyan-400/20 text-cyan-400 px-6 py-2 rounded-md hover:bg-cyan-400/30 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-cyan-400">Available</span>
            <span className="text-fuchsia-500"> Quizzes</span>
          </h1>
          <p className="text-gray-400 text-lg">Choose a quiz to test your development knowledge</p>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <h2 className="text-xl font-semibold mb-3 text-cyan-400">{quiz.title}</h2>
                <p className="text-gray-400 mb-4">{quiz.description || 'No description available'}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">
                    {quiz.questions?.length || 0} questions
                  </span>
                  {quiz.joinCode && (
                    <span className="text-sm bg-fuchsia-500/20 text-fuchsia-500 px-2 py-1 rounded font-mono">
                      {quiz.joinCode}
                    </span>
                  )}
                </div>

                <Link
                  href={`/play/${quiz.id}/waiting`}
                  className="block w-full bg-cyan-400 text-slate-900 text-center py-2 rounded-md font-semibold hover:bg-cyan-500 transition"
                >
                  Join Quiz
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <p className="text-xl">No quizzes available at the moment.</p>
              <p>Check back later for new challenges!</p>
            </div>
            <Link
              href="/"
              className="inline-block bg-cyan-400/20 text-cyan-400 px-6 py-2 rounded-md hover:bg-cyan-400/30 transition mt-4"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}