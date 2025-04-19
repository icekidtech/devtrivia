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
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
  const [questions, setQuestions] = useState<any[]>([]);

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

  // Fetch questions for selected quiz
  useEffect(() => {
    if (selectedQuizId) {
      fetch(`${BACKEND}/questions/quiz/${selectedQuizId}`)
        .then(res => res.json())
        .then(setQuestions);
    }
  }, [selectedQuizId]);

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

  // Add option
  const addOption = () => setOptions([...options, { text: '', isCorrect: false }]);
  // Remove option
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  // Update option text
  const updateOptionText = (idx: number, text: string) => {
    setOptions(options.map((opt, i) => i === idx ? { ...opt, text } : opt));
  };
  // Set correct answer
  const setCorrect = (idx: number) => {
    setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === idx })));
  };

  // Create question and answers
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId || !questionText || options.length < 2) return;
    // 1. Create question
    const questionRes = await fetch(`${BACKEND}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: questionText, quizId: selectedQuizId }),
    });
    const question = await questionRes.json();
    // 2. Create answers
    await Promise.all(options.map(opt =>
      fetch(`${BACKEND}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: opt.text, questionId: question.id, isCorrect: opt.isCorrect }),
      })
    ));
    setQuestionText('');
    setOptions([{ text: '', isCorrect: false }]);
    // Refresh questions
    fetch(`${BACKEND}/questions/quiz/${selectedQuizId}`)
      .then(res => res.json())
      .then(setQuestions);
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

      {/* Select Quiz to Add Question */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Add Question to Quiz</h2>
        <select
          value={selectedQuizId || ''}
          onChange={e => setSelectedQuizId(e.target.value)}
          className="border rounded px-2 py-1 mb-2"
        >
          <option value="">Select Quiz</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
        {selectedQuizId && (
          <form onSubmit={handleCreateQuestion} className="space-y-2">
            <input
              type="text"
              placeholder="Question text"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              required
              className="border rounded px-2 py-1 w-full"
            />
            <div>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center mb-1">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt.text}
                    onChange={e => updateOptionText(idx, e.target.value)}
                    required
                    className="border rounded px-2 py-1 mr-2"
                  />
                  <input
                    type="radio"
                    name="correct"
                    checked={opt.isCorrect}
                    onChange={() => setCorrect(idx)}
                    className="mr-1"
                  />
                  <span className="mr-2">Correct</span>
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(idx)} className="text-red-600">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOption} className="text-blue-600 mt-1">Add Option</button>
            </div>
            <button type="submit" className="bg-primary text-white px-4 py-1 rounded">Add Question</button>
          </form>
        )}
      </section>

      {/* List Questions for Selected Quiz */}
      {selectedQuizId && (
        <section>
          <h2 className="text-xl font-bold mb-2">Questions for Selected Quiz</h2>
          <ul>
            {questions.map(q => (
              <li key={q.id}>
                <strong>{q.text}</strong>
                <ul>
                  {q.answers?.map((a: any, idx: number) => (
                    <li key={a.id}>
                      {a.text} {a.isCorrect && <span className="text-green-600 font-bold">(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}