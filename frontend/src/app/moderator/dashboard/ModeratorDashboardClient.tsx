'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { User, Quiz, Question, Answer, Option, LeaderboardEntry } from '@/types';
import { handleApiError, safeFetch } from '@/utils/errorHandling';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ModeratorDashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Option[]>([{ text: '', isCorrect: false }]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        console.log('User from localStorage:', u);
        
        fetch(`${BACKEND}/quizzes`)
          .then(res => res.json())
          .then(data => {
            console.log('Quizzes from API:', data);
            const userQuizzes = data.filter((q: any) => {
              if (!q.owner) {
                console.log('Quiz missing owner data:', q);
                return false;
              }
              return q.owner.name === u.name;
            });
            console.log('Filtered quizzes:', userQuizzes);
            setQuizzes(userQuizzes);
            setLoading(false);
          });
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        setError('User data corrupted.');
        setLoading(false);
      }
    } else {
      setError('User not found. Please log in again.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      console.log(`Fetching questions for quiz: ${selectedQuizId}`);
      fetch(`${BACKEND}/questions/quiz/${selectedQuizId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Questions received:', data);
          setQuestions(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Error fetching questions:', err);
          setError(`Failed to fetch questions: ${err.message}`);
          setQuestions([]);
        });
    }
  }, [selectedQuizId]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError('User not loaded.');
      console.error('User not loaded.');
      return;
    }
    
    if (!user.name) {
      setError('Username not found. Please log in again.');
      console.error('Missing username');
      return;
    }
    
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    
    try {
      console.log('Creating quiz with:', { title, description, ownerName: user.name });
      const res = await fetch(`${BACKEND}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          ownerName: user.name
        }),
      });
      
      if (!res.ok) {
        const errMsg = await res.text();
        setError(`Failed to create quiz: ${errMsg}`);
        console.error('Failed to create quiz:', errMsg);
        return;
      }
      
      const newQuiz = await res.json();
      setQuizzes([...quizzes, newQuiz]);
      setTitle('');
      setDescription('');
      console.log('Quiz created:', newQuiz);
    } catch (err) {
      setError('An error occurred while creating the quiz.');
      console.error('Error in handleCreateQuiz:', err);
    }
  };

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

  const handleDeleteQuiz = (id: string) => {
    fetch(`${BACKEND}/quizzes/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) setQuizzes(quizzes.filter(q => q.id !== id));
      });
  };

  const handlePublishQuiz = async (id: string): Promise<void> => {
    try {
      const updatedQuiz = await safeFetch(`${BACKEND}/quizzes/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      setQuizzes(quizzes.map(q => q.id === id ? updatedQuiz : q));
      console.log('Quiz published successfully:', updatedQuiz);
    } catch (error) {
      setError(handleApiError(error, 'Failed to publish quiz'));
    }
  };

  const handleUnpublishQuiz = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND}/quizzes/${id}/unpublish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to unpublish quiz: ${res.statusText}`);
      }
      
      const updatedQuiz = await res.json();
      setQuizzes(quizzes.map(q => q.id === id ? updatedQuiz : q));
      console.log('Quiz unpublished:', updatedQuiz);
    } catch (err) {
      console.error('Error unpublishing quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to unpublish quiz');
    }
  };

  const handleViewLeaderboard = (quizId: string) => {
    setSelectedQuiz(quizId);
    fetch(`${BACKEND}/quizzes/${quizId}/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data));
  };

  const addOption = () => setOptions([...options, { text: '', isCorrect: false }]);
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const updateOptionText = (idx: number, text: string) => {
    setOptions(options.map((opt, i) => i === idx ? { ...opt, text } : opt));
  };
  
  const setCorrect = (idx: number) => {
    setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === idx })));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedQuizId || !questionText || options.length < 2) {
      const errorMessage = !selectedQuizId 
        ? "Please select a quiz"
        : !questionText 
          ? "Question text is required" 
          : "At least two answer options are required";
      
      setError(errorMessage);
      console.error(errorMessage);
      return;
    }
    
    try {
      console.log('Creating question:', { text: questionText, quizId: selectedQuizId });
      const questionRes = await fetch(`${BACKEND}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questionText, quizId: selectedQuizId }),
      });
      
      if (!questionRes.ok) {
        const errorText = await questionRes.text();
        throw new Error(`Failed to create question: ${errorText}`);
      }
      
      const question = await questionRes.json();
      console.log('Question created:', question);
      
      console.log('Creating answers:', options);
      await Promise.all(options.map(opt =>
        fetch(`${BACKEND}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: opt.text, 
            questionId: question.id, 
            isCorrect: opt.isCorrect 
          }),
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to create answer: ${res.statusText}`);
          return res.json();
        })
      ));
      
      setQuestionText('');
      setOptions([{ text: '', isCorrect: false }]);
      
      const questionsRes = await fetch(`${BACKEND}/questions/quiz/${selectedQuizId}`);
      if (!questionsRes.ok) {
        throw new Error(`Failed to refresh questions: ${questionsRes.statusText}`);
      }
      const refreshedQuestions = await questionsRes.json();
      setQuestions(Array.isArray(refreshedQuestions) ? refreshedQuestions : []);
      console.log('Questions refreshed:', refreshedQuestions);
      
    } catch (err) {
      console.error('Error in handleCreateQuestion:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the question');
    }
  };

  const startEditingQuestion = (question: Question): void => {
    const questionOptions = question.answers?.map(a => ({
      id: a.id,
      text: a.text,
      isCorrect: a.isCorrect
    })) || [];
    
    setEditingQuestion(question);
    setQuestionText(question.text);
    setOptions(questionOptions.length ? questionOptions : [{ text: '', isCorrect: false }]);
    setShowQuestionEditor(true);
  };

  const updateQuestion = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    
    if (!editingQuestion || !questionText) {
      setError("Question text is required");
      return;
    }
    
    try {
      const questionRes = await fetch(`${BACKEND}/questions/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questionText }),
      });
      
      if (!questionRes.ok) {
        throw new Error(`Failed to update question: ${questionRes.statusText}`);
      }
      
      const answersRes = await fetch(`${BACKEND}/answers/question/${editingQuestion.id}`);
      const existingAnswers = await answersRes.json();
      
      await Promise.all(existingAnswers.map((answer: Answer) => 
        fetch(`${BACKEND}/answers/${answer.id}`, { method: 'DELETE' })
      ));
      
      await Promise.all(options.map(opt =>
        fetch(`${BACKEND}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: opt.text, 
            questionId: editingQuestion.id, 
            isCorrect: opt.isCorrect 
          }),
        })
      ));
      
      const questionsRes = await fetch(`${BACKEND}/questions/quiz/${selectedQuizId}`);
      if (!questionsRes.ok) {
        throw new Error(`Failed to refresh questions: ${questionsRes.statusText}`);
      }
      const refreshedQuestions = await questionsRes.json();
      setQuestions(Array.isArray(refreshedQuestions) ? refreshedQuestions : []);
      
      setQuestionText('');
      setOptions([{ text: '', isCorrect: false }]);
      setEditingQuestion(null);
      setShowQuestionEditor(false);
      
      console.log('Question updated successfully');
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the question');
    }
  };

  const handleDeleteQuestion = async (questionId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this question? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Failed to delete question: ${res.statusText}`);
      }

      setQuestions(questions.filter(q => q.id !== questionId));
      console.log('Question deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8 border-b border-cyan-400/30 pb-4">
        <h1 className="text-3xl font-bold text-center flex-1">Moderator Dashboard</h1>
      </div>

      {error && (
        <div className="bg-red-400/20 border border-red-400/40 text-red-400 p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Create Quiz */}
      <section className="glass-card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Create Quiz</h2>
        <form onSubmit={handleCreateQuiz} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="cyberpunk-input flex-1"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="cyberpunk-input flex-1"
          />
          <button
            type="submit"
            className="bg-cyan-400/90 text-slate-900 font-bold py-2 px-6 rounded transition duration-300 hover:bg-cyan-400 shadow-md hover:shadow-neon-cyan"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Create'}
          </button>
        </form>
      </section>

      {/* Manage Quizzes */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Manage Quizzes</h2>
        <div className="space-y-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="glass-card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-200">{quiz.title}</h3>
                  <p className="text-gray-200/70">{quiz.description}</p>
                  <p className="text-sm text-gray-200/60 mt-1">
                    Questions: {quiz.questions?.length || 0}
                    {quiz.published && (
                      <span className="ml-4 text-lime-400">
                        Published
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {quiz.published ? (
                    <div className="text-center">
                      <div className="bg-cyan-400/10 border border-cyan-400/40 text-cyan-400 px-3 py-1 rounded-md mb-2">
                        <span className="font-mono font-bold">Join Code: {quiz.joinCode}</span>
                      </div>
                      <div className="my-3 bg-slate-900 p-3 inline-block rounded border border-cyan-400/30">
                        <QRCode 
                          value={`${window.location.origin}/join?code=${quiz.joinCode}`} 
                          size={100}
                          bgColor={"rgba(26, 26, 46, 0.8)"}
                          fgColor={"#00D4FF"}
                        />
                      </div>
                      <button
                        onClick={() => handleUnpublishQuiz(quiz.id)}
                        className="text-red-400 hover:text-red-400 hover:underline text-sm block mt-2"
                      >
                        Unpublish Quiz
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePublishQuiz(quiz.id)}
                      className="bg-cyan-400/90 text-slate-900 font-bold py-2 px-6 rounded transition duration-300 hover:bg-cyan-400 shadow-md hover:shadow-neon-cyan"
                      disabled={quiz.questions?.length < 1}
                    >
                      Publish Quiz
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 px-4 py-1 rounded border border-cyan-400/30 transition-colors duration-300"
                >
                  {quiz.published ? "View Questions" : "Edit Questions"}
                </button>
                <button
                  onClick={() => handleViewLeaderboard(quiz.id)}
                  className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-500 px-4 py-1 rounded border border-fuchsia-500/30 transition-colors duration-300"
                >
                  View Leaderboard
                </button>
                {!quiz.published && (
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="bg-red-400/20 hover:bg-red-400/30 text-red-400 px-4 py-1 rounded border border-red-400/30 transition-colors duration-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      {selectedQuiz && (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">Leaderboard for Quiz</h2>
          <button onClick={() => setSelectedQuiz(null)} className="mb-2 text-cyan-400 hover:underline">Close</button>
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
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Add Question to Quiz</h2>
        <select
          value={selectedQuizId || ''}
          onChange={e => setSelectedQuizId(e.target.value)}
          className="bg-slate-900/30 border border-cyan-400/40 text-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded"
        >
          <option value="">Select Quiz</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
        {selectedQuizId && !quizzes.find(q => q.id === selectedQuizId)?.published && (
          <section className="mt-6">
            <h2 className="text-xl font-bold mb-3">
              {editingQuestion ? 'Edit Question' : 'Add Question to Quiz'}
            </h2>
            
            <form onSubmit={editingQuestion ? updateQuestion : handleCreateQuestion} className="space-y-3 glass-card">
              <input
                type="text"
                placeholder="Question text"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required
                className="cyberpunk-input w-full"
              />
              
              <div className="space-y-2">
                <label className="block font-medium text-gray-200">Answer Options</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={e => updateOptionText(idx, e.target.value)}
                      required
                      className="cyberpunk-input mr-3 flex-1"
                    />
                    <div className="flex items-center mr-3">
                      <input
                        type="radio"
                        name="correct"
                        checked={opt.isCorrect}
                        onChange={() => setCorrect(idx)}
                        className="mr-1"
                      />
                      <span className="text-gray-200">Correct</span>
                    </div>
                    
                    {options.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => removeOption(idx)} 
                        className="text-red-400 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addOption}
                  className="text-cyan-400 hover:text-cyan-400"
                >
                  + Add Option
                </button>
              </div>
              
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionText('');
                    setOptions([{ text: '', isCorrect: false }]);
                    setEditingQuestion(null);
                  }}
                  className="text-gray-200 hover:underline"
                >
                  {editingQuestion ? 'Cancel' : 'Clear'}
                </button>
                
                <button
                  type="submit"
                  className="bg-cyan-400/90 text-slate-900 font-bold py-2 px-6 rounded transition duration-300 hover:bg-cyan-400 shadow-md hover:shadow-neon-cyan"
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </section>
        )}
      </section>

      {/* List Questions for Selected Quiz */}
      {selectedQuizId && (
        <section>
          <h2 className="text-xl font-bold mb-2 text-cyan-400">
            Questions for {quizzes.find(q => q.id === selectedQuizId)?.title || 'Selected Quiz'}
          </h2>
          
          {questions.length > 0 ? (
            <ul className="space-y-4">
              {questions.map(q => (
                <li key={q.id} className="border rounded p-3 glass-card">
                  <div className="flex justify-between">
                    <strong className="text-lg text-gray-200">{q.text}</strong>
                    
                    {!quizzes.find(quiz => quiz.id === selectedQuizId)?.published && (
                      <div>
                        <button
                          onClick={() => startEditingQuestion(q)}
                          className="text-cyan-400 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <ul className="mt-2 ml-5 list-disc">
                    {q.answers?.map((a: Answer) => (
                      <li key={a.id} className={a.isCorrect ? 'text-lime-400 font-medium' : 'text-gray-200'}>
                        {a.text} {a.isCorrect && '✓'}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-200/50 italic">No questions added to this quiz yet.</p>
          )}
        </section>
      )}
    </div>
  );
}