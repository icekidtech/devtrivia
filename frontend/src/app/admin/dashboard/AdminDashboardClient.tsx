'use client';

import { useState, useEffect } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminDashboardClient() {
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}').token
    : '';

  useEffect(() => {
    // Get admin name
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user.name);
      } catch {}
    }

    // Fetch all data
    Promise.all([
      fetch(`${BACKEND}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${BACKEND}/quizzes`).then(r => r.json()),
      fetch(`${BACKEND}/questions`).then(r => r.json()),
      fetch(`${BACKEND}/answers`).then(r => r.json()),
    ]).then(([users, quizzes, questions, answers]) => {
      console.log('Fetched users:', users); // <-- Add this line
      setUsers(Array.isArray(users) ? users : []);
      setQuizzes(Array.isArray(quizzes) ? quizzes : []);
      setQuestions(Array.isArray(questions) ? questions : []);
      setAnswers(Array.isArray(answers) ? answers : []);
      setLoading(false);
    });
  }, [token]);

  // User role update
  const handleRoleChange = (id: string, newRole: string) => {
    fetch(`${BACKEND}/admin/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    })
      .then(res => res.json())
      .then(updatedUser => {
        setUsers(users.map(u => (u.id === id ? { ...u, role: updatedUser.role } : u)));
      });
  };

  // Quiz update
  const handleQuizUpdate = (id: string, title: string, description: string) => {
    fetch(`${BACKEND}/quizzes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
      .then(res => res.json())
      .then(updatedQuiz => {
        setQuizzes(quizzes.map(q => (q.id === id ? updatedQuiz : q)));
      });
  };

  // Question update
  const handleQuestionUpdate = (id: string, text: string) => {
    fetch(`${BACKEND}/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(res => res.json())
      .then(updatedQuestion => {
        setQuestions(questions.map(q => (q.id === id ? updatedQuestion : q)));
      });
  };

  // Answer update
  const handleAnswerUpdate = (id: string, text: string) => {
    fetch(`${BACKEND}/answers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(res => res.json())
      .then(updatedAnswer => {
        setAnswers(answers.map(a => (a.id === id ? updatedAnswer : a)));
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Welcome, {userName}</span>
        <h1 className="text-3xl font-bold text-center flex-1">Administrator Dashboard</h1>
      </div>

      {/* Users */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="border px-2 py-1">{user.name}</td>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1">{user.role}</td>
                <td className="border px-2 py-1">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Quizzes */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Quizzes</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Owner</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz.id}>
                <td className="border px-2 py-1">
                  <input
                    defaultValue={quiz.title}
                    onBlur={e => handleQuizUpdate(quiz.id, e.target.value, quiz.description)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    defaultValue={quiz.description}
                    onBlur={e => handleQuizUpdate(quiz.id, quiz.title, e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1">{quiz.ownerId}</td>
                <td className="border px-2 py-1">Edit above</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Questions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Questions</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Text</th>
              <th className="border px-2 py-1">Quiz ID</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id}>
                <td className="border px-2 py-1">
                  <input
                    defaultValue={q.text}
                    onBlur={e => handleQuestionUpdate(q.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1">{q.quizId}</td>
                <td className="border px-2 py-1">Edit above</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Answers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Answers</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Text</th>
              <th className="border px-2 py-1">Question ID</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {answers.map(a => (
              <tr key={a.id}>
                <td className="border px-2 py-1">
                  <input
                    defaultValue={a.text}
                    onBlur={e => handleAnswerUpdate(a.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1">{a.questionId}</td>
                <td className="border px-2 py-1">Edit above</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}