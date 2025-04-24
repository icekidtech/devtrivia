'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Quiz } from '@/types';
import { 
  Search, 
  User as UserIcon, 
  BarChart3, 
  Award, 
  LogOut, 
  Settings,
  Clock,
  Check,
  X,
  ChevronDown
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function UserDashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [pastQuizzes, setPastQuizzes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Stats for the dashboard
  const stats = {
    averageScore: '780',
    quizzesCompleted: '12',
    rank: 'Top 10%'
  };

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        
        // Fetch past quizzes for this user
        fetch(`${BACKEND}/quizzes/user-history/${userData.id}`, {
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            setPastQuizzes(data);
            setLoading(false);
          })
          .catch(err => {
            console.error("Failed to fetch quiz history:", err);
            setLoading(false);
          });
      } catch (err) {
        console.error('Error parsing user data:', err);
        setLoading(false);
      }
    } else {
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    
    if (!joinCode.trim()) {
      setJoinError('Please enter a valid join code');
      return;
    }
    
    // Simulating join quiz functionality
    setJoinSuccess(`Successfully joined quiz with code ${joinCode}!`);
    setTimeout(() => {
      window.location.href = `/quiz/${joinCode}`;
    }, 1500);
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
              activeNav === 'join' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => setActiveNav('join')}
          >
            <Award className="mr-3 h-5 w-5" />
            <span>Join Quiz</span>
          </div>
          
          <div 
            className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-all ${
              activeNav === 'past' 
                ? 'bg-cyan-400/20 text-cyan-400' 
                : 'hover:bg-cyan-400/10 hover:text-cyan-400'
            }`}
            onClick={() => setActiveNav('past')}
          >
            <Clock className="mr-3 h-5 w-5" />
            <span>Past Results</span>
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
            {activeNav === 'overview' && 'Overview'}
            {activeNav === 'join' && 'Join Quiz'}
            {activeNav === 'past' && 'Past Results'}
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
          
          {/* Overview Tab Content */}
          {activeNav === 'overview' && (
            <>
              <div className="mb-8">
                <form className="flex items-stretch md:w-[70%]" onSubmit={handleJoinQuiz}>
                  <input 
                    type="text"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    placeholder="Enter a quiz code to join..."
                    className="bg-[#3A3A55] text-gray-200 px-4 py-2 rounded-l-md flex-1 border-y border-l border-cyan-400/20 focus:outline-none focus:border-cyan-400"
                  />
                  <button 
                    type="submit"
                    className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-r-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105"
                  >
                    Join Quiz
                  </button>
                </form>
                
                {joinError && (
                  <div className="mt-2 text-red-400 flex items-center">
                    <X className="h-4 w-4 mr-2" /> {joinError}
                  </div>
                )}
                
                {joinSuccess && (
                  <div className="mt-2 text-lime-400 flex items-center">
                    <Check className="h-4 w-4 mr-2" /> {joinSuccess}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity Card */}
                <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg transform transition hover:shadow-cyan-500/30">
                  <h3 className="text-lg font-semibold mb-4 text-cyan-400">Recent Activity</h3>
                  
                  {pastQuizzes && pastQuizzes.length > 0 ? (
                    <div className="space-y-4">
                      {pastQuizzes.slice(0, 3).map((result, index) => (
                        <div key={index} className="border-b border-gray-600/30 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">Quiz: {result.quizTitle}</p>
                              <p className="text-sm text-gray-400">{new Date(result.completedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-cyan-400">Score: {result.score}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Link href={`/results/${result.id}`} className="text-sm text-cyan-400 hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">
                      <p>No quiz history yet.</p>
                      <p className="mt-2">Join a quiz to get started!</p>
                    </div>
                  )}
                  
                  {pastQuizzes && pastQuizzes.length > 0 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setActiveNav('past')}
                        className="text-cyan-400 hover:underline text-sm"
                      >
                        View All Results
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Performance Snapshot */}
                <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg transform transition hover:shadow-cyan-500/30">
                  <h3 className="text-lg font-semibold mb-4 text-cyan-400">Performance Snapshot</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border-b border-gray-600/30 pb-3">
                      <p className="text-sm text-gray-400">Average Score</p>
                      <p className="font-bold text-2xl">{stats.averageScore}</p>
                    </div>
                    
                    <div className="border-b border-gray-600/30 pb-3">
                      <p className="text-sm text-gray-400">Quizzes Completed</p>
                      <p className="font-bold text-2xl">{stats.quizzesCompleted}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Rank</p>
                      <p className="font-bold text-2xl text-fuchsia-500">{stats.rank}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Popular Quizzes Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Popular Quizzes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="bg-[#2D2D44]/80 p-4 rounded-lg border border-cyan-400/20 cursor-pointer transform transition hover:scale-[1.03] hover:shadow-cyan-500/20">
                      <h4 className="font-semibold">Web Development Fundamentals</h4>
                      <p className="text-sm text-gray-400 mt-1">Test your knowledge of HTML, CSS, and JavaScript basics</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">20 questions</span>
                        <span className="text-xs">400+ participants</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Join Quiz Tab Content */}
          {activeNav === 'join' && (
            <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
              <h3 className="text-xl font-semibold mb-6">Join a Quiz</h3>
              
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <h4 className="font-medium mb-3">Enter Quiz Code</h4>
                  <form className="flex flex-col space-y-4" onSubmit={handleJoinQuiz}>
                    <input 
                      type="text"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      placeholder="Enter the 6-digit code here"
                      className="bg-[#3A3A55] text-gray-200 px-4 py-3 rounded-md border border-cyan-400/20 focus:outline-none focus:border-cyan-400 text-center uppercase tracking-widest text-xl"
                      maxLength={6}
                    />
                    
                    <button 
                      type="submit"
                      className="bg-cyan-400 text-slate-900 py-3 rounded-md font-semibold hover:bg-cyan-500 transition transform hover:scale-105"
                    >
                      Join Quiz
                    </button>
                  </form>
                  
                  {joinError && (
                    <div className="mt-2 text-red-400 text-center">{joinError}</div>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Or scan a QR code</p>
                  <div className="bg-white inline-block p-3 rounded">
                    {/* Placeholder for QR code scanner */}
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                      QR Scanner
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Past Results Tab Content */}
          {activeNav === 'past' && (
            <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20">
              <h3 className="text-xl font-semibold mb-6">Your Quiz History</h3>
              
              {pastQuizzes && pastQuizzes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-cyan-400/20">
                        <th className="pb-2">Quiz Name</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">Rank</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastQuizzes.map((result, index) => (
                        <tr key={index} className="border-b border-gray-600/30">
                          <td className="py-3">{result.quizTitle}</td>
                          <td className="py-3">{new Date(result.completedAt).toLocaleDateString()}</td>
                          <td className="py-3 font-medium text-cyan-400">{result.score}</td>
                          <td className="py-3">{result.rank || '-'}</td>
                          <td className="py-3">
                            <Link href={`/results/${result.id}`} className="text-cyan-400 hover:underline">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <p className="text-lg">No quiz history yet.</p>
                  <p className="mt-2">Join a quiz to see your results here!</p>
                  <button 
                    onClick={() => setActiveNav('join')}
                    className="mt-4 px-6 py-2 bg-cyan-400/20 text-cyan-400 rounded-md hover:bg-cyan-400/30 transition"
                  >
                    Join a Quiz
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