'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { User, Quiz, Question, Answer, Option, LeaderboardEntry } from '@/types';
import { handleApiError, safeFetch } from '@/utils/errorHandling';
import { 
  BarChart3, 
  User as UserIcon, 
  Settings, 
  LogOut,
  PlusCircle,
  List,
  CheckCircle,
  ChevronDown,
  Award
} from 'lucide-react';

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
  const [activeNav, setActiveNav] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const [timePerQuestion, setTimePerQuestion] = useState(30);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        
        fetch(`${BACKEND}/quizzes`)
          .then(res => res.json())
          .then(data => {
            const userQuizzes = data.filter((q: any) => {
              if (!q.owner) {
                return false;
              }
              return q.owner.name === u.name;
            });
            setQuizzes(userQuizzes);
            setLoading(false);
          });
      } catch (err) {
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
        .catch(err => {
          setError(`Failed to fetch questions: ${err.message}`);
          setQuestions([]);
        });
    }
  }, [selectedQuizId]);

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
        const errMsg = await res.text();
        setError(`Failed to create quiz: ${errMsg}`);
        return;
      }
      
      const newQuiz = await res.json();
      setQuizzes([...quizzes, newQuiz]);
      setTitle('');
      setDescription('');
      setTimePerQuestion(30);
    } catch (err) {
      setError('An error occurred while creating the quiz.');
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
    if (!confirm("Are you sure you want to delete this quiz? This cannot be undone.")) {
      return;
    }
    
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
    } catch (err) {
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
      return;
    }
    
    try {
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
      
    } catch (err) {
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
      
    } catch (err) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
      setError(errorMessage);
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
            <span>Profile</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-cyan-400/20 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-cyan-400">
            {activeNav === 'overview' && 'Moderator Dashboard'}
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
                <img 
                  src={`${BACKEND}${user.profileImage}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 border-2 border-cyan-400/60 flex items-center justify-center font-bold">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              
              <span className="ml-2 font-medium hidden md:block">{user?.name}</span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </div>
            
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2D2D44] border border-cyan-400/20 rounded-md shadow-lg shadow-cyan-500/20 z-50">
                <Link 
                  href="/profile" 
                  className="flex items-center px-4 py-3 hover:bg-cyan-400/10 text-gray-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
                
                <div className="border-t border-cyan-400/20"></div>
                
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full text-left px-4 py-3 hover:bg-cyan-400/10 text-gray-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {/* Background decorative elements */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
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
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Welcome Card */}
                <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-3">Welcome, <span className="text-cyan-400">{user?.name}</span></h3>
                  <p className="text-gray-400">Manage your quizzes, add questions, and track participants' performance.</p>
                  
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
                  {quizzes.slice(0, 3).map((quiz, i) => (
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                    placeholder="Enter quiz title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="bg-[#3A3A55] w-full text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Quiz Description</label>
                  <textarea
                    placeholder="Enter quiz description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-[#3A3A55] w-full text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 min-h-[100px]"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Time Per Question (seconds)</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={timePerQuestion}
                      onChange={e => setTimePerQuestion(parseInt(e.target.value))}
                      className="w-full mr-3"
                    />
                    <span className="text-cyan-400 font-mono w-12">{timePerQuestion}s</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {timePerQuestion < 15 ? "Fast-paced" : 
                     timePerQuestion < 30 ? "Standard" : 
                     timePerQuestion < 60 ? "Complex questions" : "Technical deep-dive"}
                  </p>
                </div>
                
                <div>
                  <button 
                    type="submit"
                    className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105 mr-4"
                  >
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Manage Quizzes Tab Content */}
          {activeNav === 'manage' && (
            <div>
              <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
                <h3 className="text-xl font-semibold mb-6">Your Quizzes</h3>
                
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
                                className="bg-cyan-400 text-slate-900 px-4 py-2 rounded-md font-semibold hover:bg-cyan-500 transition"
                                disabled={!quiz.questions?.length}
                              >
                                Publish Quiz
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => {
                              setSelectedQuizId(quiz.id);
                              setActiveNav('questions');
                            }}
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
                ) : (
                  <div className="text-gray-400 text-center py-10">
                    <p>You haven't created any quizzes yet.</p>
                    <button 
                      onClick={() => setActiveNav('create')}
                      className="mt-4 bg-cyan-400/20 text-cyan-400 px-4 py-2 rounded-md hover:bg-cyan-400/30 transition"
                    >
                      Create Your First Quiz
                    </button>
                  </div>
                )}
              </div>
              
              {/* Leaderboard Modal */}
              {selectedQuiz && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-cyan-400">
                        Leaderboard for {quizzes.find(q => q.id === selectedQuiz)?.title}
                      </h2>
                      <button 
                        onClick={() => setSelectedQuiz(null)}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        Close
                      </button>
                    </div>
                    
                    {leaderboard && leaderboard.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b border-cyan-400/20">
                              <th className="pb-2">Rank</th>
                              <th className="pb-2">Player</th>
                              <th className="pb-2">Score</th>
                              <th className="pb-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboard.map((entry, idx) => (
                              <tr key={idx} className="border-b border-gray-600/30">
                                <td className="py-3">{idx + 1}</td>
                                <td className="py-3">{entry.userName}</td>
                                <td className="py-3 font-medium text-cyan-400">{entry.score}</td>
                                <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center py-8">
                        <p>No entries in the leaderboard yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Questions Tab Content */}
          {activeNav === 'questions' && (
            <div>
              {selectedQuizId ? (
                <div className="space-y-8">
                  <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">
                        {quizzes.find(q => q.id === selectedQuizId)?.title} Questions
                      </h3>
                      
                      <select
                        value={selectedQuizId}
                        onChange={e => setSelectedQuizId(e.target.value)}
                        className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400"
                      >
                        {quizzes.map(q => (
                          <option key={q.id} value={q.id}>{q.title}</option>
                        ))}
                      </select>
                    </div>
                    
                    {!quizzes.find(q => q.id === selectedQuizId)?.published && (
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
                              onChange={e => setQuestionText(e.target.value)}
                              required
                              className="bg-[#3A3A55] w-full text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm text-gray-400">Answer Options</label>
                            {options.map((opt, idx) => (
                              <div key={idx} className="flex items-center space-x-2 mb-3">
                                <input
                                  type="text"
                                  placeholder={`Option ${idx + 1}`}
                                  value={opt.text}
                                  onChange={e => updateOptionText(idx, e.target.value)}
                                  required
                                  className="bg-[#3A3A55] flex-1 text-gray-200 px-4 py-2 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400"
                                />
                                <div className="flex items-center">
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
                                    className="text-red-400 hover:text-red-500"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={addOption}
                              className="text-cyan-400 hover:text-cyan-500 mt-2"
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
                        <p>No questions added to this quiz yet.</p>
                        {!quizzes.find(quiz => quiz.id === selectedQuizId)?.published && (
                          <p className="mt-2">Use the form above to add questions.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-10">
                  <p>Please select a quiz to manage questions.</p>
                  <button 
                    onClick={() => setActiveNav('create')}
                    className="mt-4 bg-cyan-400/20 text-cyan-400 px-4 py-2 rounded-md hover:bg-cyan-400/30 transition"
                  >
                    Create a New Quiz
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Profile Tab Content */}
          {activeNav === 'profile' && (
            <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
              <h3 className="text-xl font-semibold mb-6">Your Profile</h3>
              
              <div className="max-w-md mx-auto">
                <div className="flex flex-col items-center mb-6">
                  {user?.profileImage ? (
                    <img 
                      src={`${BACKEND}${user.profileImage}`}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-fuchsia-500/20 border-2 border-cyan-400 flex items-center justify-center font-bold text-3xl mb-4">
                      {user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  
                  <h4 className="text-xl font-medium">{user?.name}</h4>
                  <p className="text-gray-400">{user?.email}</p>
                  <p className="bg-fuchsia-500/20 text-fuchsia-500 px-3 py-1 rounded-full text-sm mt-2">
                    {user?.role || 'MODERATOR'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
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
    </div>
  );
}