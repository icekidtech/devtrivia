'use client';

import { useState, useEffect } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ModeratorDashboardClient() {
  const [user, setUser] = useState<{ id: string; name: string; token: string } | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        fetch(`${BACKEND}/quizzes`)
          .then(res => res.json())
          .then(data => {
            // Only show quizzes owned by this moderator
            setQuizzes(data.filter((q: any) => q.ownerId === u.id));
            setLoading(false);
          });
      } catch {}
    }
  }, []);

  // Create quiz
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    fetch(`${BACKEND}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, ownerId: user.id }),
    })
      .then(res => res.json())
      .then(newQuiz => {
        setQuizzes([...quizzes, newQuiz]);
        setTitle('');
        setDescription('');
      });
  };

  // Edit quiz
  const handleEditQuiz = (id: string, newTitle: string, newDescription: string) => {
    fetch(`${BACKEND}/quizzes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    })
      .then(res => res.json())
      .then(updatedQuiz => {
        setQuizzes(quizzes.map(q => (q.id === id ? updatedQuiz : q)));
      });
  };

  // Delete quiz
  const handleDeleteQuiz = (id: string) => {
    fetch(`${BACKEND}/quizzes/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) setQuizzes(quizzes.filter(q => q.id !== id));
      });
  };

  // View leaderboard for a quiz
  const handleViewLeaderboard = (quizId: string) => {
    setSelectedQuiz(quizId);
    fetch(`${BACKEND}/quizzes/${quizId}/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Welcome, {user?.name}</span>
        <h1 className="text-3xl font-bold text-center flex-1">Moderator Dashboard</h1>
      </div>

      {/* Create Quiz */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>
        <form onSubmit={handleCreateQuiz} className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="border rounded px-2 py-1 flex-1"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
          />
          <button type="submit" className="bg-primary text-white px-4 py-1 rounded">Create</button>
        </form>
      </section>

      {/* Manage Quizzes */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Quizzes</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz.id}>
                <td className="border px-2 py-1">
                  <input
                    defaultValue={quiz.title}
                    onBlur={e => handleEditQuiz(quiz.id, e.target.value, quiz.description)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    defaultValue={quiz.description}
                    onBlur={e => handleEditQuiz(quiz.id, quiz.title, e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-600 hover:underline mr-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewLeaderboard(quiz.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Leaderboard
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Leaderboard */}
      {selectedQuiz && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Leaderboard for Quiz</h2>
          <button onClick={() => setSelectedQuiz(null)} className="mb-2 text-blue-600 hover:underline">Close</button>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{entry.userName}</td>
                  <td className="border px-2 py-1">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}