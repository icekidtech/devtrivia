'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { User, Quiz, Question, Answer, Option } from '@/types';
import { 
  BarChart3, 
  User as UserIcon, 
  Settings, 
  LogOut,
  PlusCircle,
  List,
  CheckCircle,
  ChevronDown,
  Play
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function ModeratorDashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Option[]>([{ text: '', isCorrect: false }]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [timePerQuestion, setTimePerQuestion] = useState(20);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        
        fetch(`${BACKEND}/quizzes`)
          .then(res => res.json())
          .then(data => {
            const userQuizzes = data.filter((q: Quiz) => {
              if (!q.owner) {
                return false;
              }
              return q.owner.name === u.name;
            });
            setQuizzes(userQuizzes);
            setLoading(false);
          });
      } catch {
        setError('User data corrupted.');
        setLoading(false);
      }
    } else {
      setError('User not found. Please log in again.');
      setLoading(false);
    }
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetch(`${BACKEND}/questions/quiz/${selectedQuizId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          setQuestions(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setError(`Failed to fetch questions`);
          setQuestions([]);
        });
    }
  }, [selectedQuizId]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      if (!user.token || isTokenExpired(user.token)) {
        localStorage.removeItem('user');
        window.location.href = '/login?expired=1';
        return;
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError('User not loaded.');
      return;
    }
    
    if (!user.name) {
      setError('Username not found. Please log in again.');
      return;
    }
    
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    
    try {
      const res = await fetch(`${BACKEND}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          ownerName: user.name,
          timePerQuestion
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to create quiz: ${res.statusText}`);
      }
      
      const newQuiz = await res.json();
      setQuizzes([...quizzes, newQuiz]);
      setTitle('');
      setDescription('');
      setActiveNav('manage');
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz. Please try again.');
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`${BACKEND}/quizzes/${quizId}/publish`, {
        method: 'PATCH',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to publish quiz: ${res.statusText}`);
      }
      
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, published: true } : q));
    } catch (err) {
      console.error('Error publishing quiz:', err);
      setError('Failed to publish quiz. Please try again.');
    }
  };

  const handleUnpublishQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`${BACKEND}/quizzes/${quizId}/unpublish`, {
        method: 'PATCH',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to unpublish quiz: ${res.statusText}`);
      }
      
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, published: false } : q));
    } catch (err) {
      console.error('Error unpublishing quiz:', err);
      setError('Failed to unpublish quiz. Please try again.');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${BACKEND}/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete quiz: ${res.statusText}`);
      }
      
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    }
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };
  
  const removeOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };
  
  const updateOption = (idx: number, text: string) => {
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
      return;
    }
    
    try {
      const questionRes = await fetch(`${BACKEND}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questionText, quizId: selectedQuizId }),
      });
      
      if (!questionRes.ok) {
        throw new Error(`Failed to create question: ${questionRes.statusText}`);
      }
      
      const newQuestion = await questionRes.json();
      
      await Promise.all(options.map(opt => 
        fetch(`${BACKEND}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: opt.text, 
            questionId: newQuestion.id, 
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
      
    } catch {
      setError('An error occurred while creating the question');
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
  };

  const updateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!editingQuestion || !questionText || options.length < 2) {
      setError('Question text and at least two answer options are required');
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
      
      if (editingQuestion.answers) {
        await Promise.all(editingQuestion.answers.map(answer => 
          fetch(`${BACKEND}/answers/${answer.id}`, {
            method: 'DELETE',
          })
        ));
      }
      
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
      
    } catch {
      setError('An error occurred while updating the question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const res = await fetch(`${BACKEND}/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete question: ${res.statusText}`);
      }
      
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch {
      setError('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-gray-200 font-sans">
      {/* Sidebar */}
      <div className="w-1/5 min-w-[220px] bg-[#2D2D44] border-r border-cyan-400/30 shadow-lg shadow-cyan-400/5">
        <div className="p-4 flex items-center justify-center mb-8">
          <Link href="/" className="block">
            <h1 className="text-2xl font-bold relative group">
              <span className="text-cyan-400 neon-text">Dev</span>
              <span className="text-fuchsia-500 neon-text">Trivia</span>
            </h1>
          </Link>
        </div>
        
        <nav className="px-2">
          <div 
            className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-all ${
              activeNav === 'overview' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => setActiveNav('overview')}
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            <span>Overview</span>
          </div>
          
          <div 
            className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-all ${
              activeNav === 'create' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => setActiveNav('create')}
          >
            <PlusCircle className="mr-3 h-5 w-5" />
            <span>Create Quiz</span>
          </div>
          
          <div 
            className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-all ${
              activeNav === 'manage' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => setActiveNav('manage')}
          >
            <List className="mr-3 h-5 w-5" />
            <span>Manage Quizzes</span>
          </div>
          
          <div 
            className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-all ${
              activeNav === 'questions' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => {
              setActiveNav('questions');
              if (!selectedQuizId && quizzes.length > 0) {
                setSelectedQuizId(quizzes[0].id);
              }
            }}
          >
            <CheckCircle className="mr-3 h-5 w-5" />
            <span>Manage Questions</span>
          </div>
          
          <div 
            className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-all ${
              activeNav === 'profile' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => setActiveNav('profile')}
          >
            <UserIcon className="mr-3 h-5 w-5" />
            <span>User Profile</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-[#2D2D44]/80 p-4 rounded-lg border border-cyan-400/20">
          <h2 className="text-3xl font-bold text-cyan-400">
            {activeNav === 'overview' && 'Dashboard Overview'}
            {activeNav === 'create' && 'Create Quiz'}
            {activeNav === 'manage' && 'Manage Quizzes'}
            {activeNav === 'questions' && 'Manage Questions'}
            {activeNav === 'profile' && 'User Profile'}
          </h2>
          
          <div className="flex items-center relative" ref={dropdownRef}>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.profileImage ? (
                <Image 
                  src={`${BACKEND}${user.profileImage}`}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-slate-900 font-bold border-2 border-cyan-400">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span className="ml-3 font-medium">{user?.name}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </div>
            
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#2D2D44] border border-cyan-400/20 rounded-lg shadow-lg z-10 min-w-[200px]">
                <Link 
                  href="/profile" 
                  className="flex items-center px-4 py-3 hover:bg-cyan-400/10 rounded-t-lg"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 hover:bg-red-400/10 text-red-400 rounded-b-lg"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-fuchsia-500/5 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        
        {/* Error messages */}
        {error && (
          <div className="bg-red-400/20 border border-red-400/40 text-red-400 p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Overview Tab Content */}
        {activeNav === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Welcome Card */}
              <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg">
                <h3 className="text-2xl font-semibold mb-3">Welcome, <span className="text-cyan-400">{user?.name}</span></h3>
                <p className="text-gray-400">Manage your quizzes, add questions, and track participants&apos; performance.</p>
                
                <div className="mt-6">
                  <button 
                    onClick={() => setActiveNav('create')}
                    className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105 mr-4"
                  >
                    Create Quiz
                  </button>
                  <button
                    onClick={() => setActiveNav('manage')}
                    className="bg-[#3A3A55] text-gray-200 px-6 py-2 rounded-md border border-cyan-400/20 font-semibold hover:bg-[#3A3A55]/80 transition"
                  >
                    Manage Quizzes
                  </button>
                </div>
              </div>
              
              {/* Quiz Stats */}
              <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Quiz Statistics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-600/30 pb-3">
                    <p className="text-sm text-gray-400">Total Quizzes</p>
                    <p className="font-bold text-2xl">{quizzes.length}</p>
                  </div>
                  
                  <div className="border-b border-gray-600/30 pb-3">
                    <p className="text-sm text-gray-400">Published Quizzes</p>
                    <p className="font-bold text-2xl">{quizzes.filter(q => q.published).length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Total Questions</p>
                    <p className="font-bold text-2xl">
                      {quizzes.reduce((acc, quiz) => acc + (quiz.questions?.length || 0), 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Participants</p>
                    <p className="font-bold text-2xl">--</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Quizzes */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Recent Quizzes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.slice(0, 3).map((quiz) => (
                  <div key={quiz.id} className="bg-[#2D2D44]/80 p-4 rounded-lg border border-cyan-400/20 cursor-pointer transform transition hover:scale-[1.03] hover:shadow-cyan-500/20">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{quiz.title}</h4>
                      {quiz.published && (
                        <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-1 rounded">Published</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{quiz.description || 'No description'}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">
                        {quiz.questions?.length ?? 0} questions
                      </span>
                      <Link 
                        href={`/moderate/${quiz.id}/waiting`}
                        className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-1"
                      >
                        <Play size={16} />
                        Start Session
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Create Quiz Tab Content */}
        {activeNav === 'create' && (
          <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
            <h3 className="text-xl font-semibold mb-6">Create New Quiz</h3>
            
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  rows={3}
                  className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Time per Question (seconds)</label>
                <input
                  type="number"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  min="5"
                  max="300"
                  className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 w-full"
                />
              </div>
              
              <button
                type="submit"
                className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105"
              >
                Create Quiz
              </button>
            </form>
          </div>
        )}
        
        {/* Manage Quizzes Tab Content */}
        {activeNav === 'manage' && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-cyan-400">Your Quizzes</h3>
            
            {quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="border-b border-gray-600/30 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap justify-between items-start">
                      <div className="mb-2">
                        <h4 className="text-lg font-semibold">{quiz.title}</h4>
                        <p className="text-gray-400">{quiz.description || 'No description'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Questions: {quiz.questions?.length ?? 0}
                          {quiz.published && (
                            <span className="ml-2 text-lime-400">• Published</span>
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
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${quiz.joinCode}`} 
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
                            className="bg-lime-500 hover:bg-lime-600 text-slate-900 px-4 py-2 rounded-md font-semibold"
                          >
                            Publish Quiz
                          </button>
                        )}
                        
                        {!quiz.published && (
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-red-400 hover:text-red-400 hover:underline text-sm"
                          >
                            Delete Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                <p>No quizzes created yet.</p>
                <button 
                  onClick={() => setActiveNav('create')}
                  className="mt-4 px-6 py-2 bg-cyan-400/20 text-cyan-400 rounded-md hover:bg-cyan-400/30 transition"
                >
                  Create Your First Quiz
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Manage Questions Tab Content */}
        {activeNav === 'questions' && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-cyan-400">Manage Questions</h3>
            
            <div className="mb-6">
              <label className="text-sm text-gray-400">Select Quiz</label>
              <select
                value={selectedQuizId || ''}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 w-full"
              >
                <option value="">Select a quiz</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>
            
            {selectedQuizId && !quizzes.find(q => q.id === selectedQuizId)?.published && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h4>
                
                <form onSubmit={editingQuestion ? updateQuestion : handleCreateQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Question Text</label>
                    <input
                      type="text"
                      placeholder="Enter question text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Answer Options</label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt.text}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setCorrect(idx)}
                          className={`px-3 py-2 rounded-md ${
                            opt.isCorrect 
                              ? 'bg-lime-500 text-slate-900' 
                              : 'bg-gray-600 text-gray-200'
                          }`}
                        >
                          {opt.isCorrect ? '✓' : '○'}
                        </button>
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="px-3 py-2 bg-red-500 text-white rounded-md"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-cyan-400 hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
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
                      className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105"
                    >
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <h4 className="text-lg font-semibold mb-4 text-cyan-400">Question List</h4>
            
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map(q => (
                  <div key={q.id} className="border border-gray-600/30 rounded-md p-4">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{q.text}</h5>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                <p>No questions added yet.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Profile Tab Content */}
        {activeNav === 'profile' && (
          <div>
            <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
              <h3 className="text-xl font-semibold mb-6">User Profile</h3>
              
              <div className="flex items-center mb-6">
                {user?.profileImage ? (
                  <Image 
                    src={`${BACKEND}${user.profileImage}`}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-4 border-cyan-400 mr-6"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-slate-900 font-bold text-2xl border-4 border-cyan-400 mr-6">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div>
                  <h4 className="text-2xl font-bold text-cyan-400">{user?.name}</h4>
                  <p className="text-gray-400">{user?.email}</p>
                  <p className="text-sm text-gray-500">Role: {user?.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Username</label>
                  <input 
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="bg-[#3A3A55] w-full text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email</label>
                  <input 
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-[#3A3A55] w-full text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Role</label>
                  <input 
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="bg-[#3A3A55] w-full text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20"
                  />
                </div>
                
                <div className="mt-4">
                  <Link 
                    href="/profile/edit" 
                    className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105 inline-block"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}