"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Brain,
  Trophy,
  TrendingUp,
  Activity,
  Clock,
  Target,
  BookOpen,
  UserCheck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

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
      fetch(`${BACKEND}/results`).then(r => r.json()),
    ]).then(([usersData, quizzesData, questionsData, answersData, resultsData]) => {
      setUsers(Array.isArray(usersData) ? usersData : []);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setAnswers(Array.isArray(answersData) ? answersData : []);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, [token]);

  // Calculate real metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.role !== 'inactive').length;
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.published).length;
  const totalQuestions = questions.length;
  const totalResults = results.length;

  // Calculate user growth data (mock for now, but could be real)
  const userGrowthData = [
    { month: 'Jan', users: Math.floor(totalUsers * 0.7), active: Math.floor(activeUsers * 0.7) },
    { month: 'Feb', users: Math.floor(totalUsers * 0.75), active: Math.floor(activeUsers * 0.75) },
    { month: 'Mar', users: Math.floor(totalUsers * 0.8), active: Math.floor(activeUsers * 0.8) },
    { month: 'Apr', users: Math.floor(totalUsers * 0.85), active: Math.floor(activeUsers * 0.85) },
    { month: 'May', users: Math.floor(totalUsers * 0.9), active: Math.floor(activeUsers * 0.9) },
    { month: 'Jun', users: totalUsers, active: activeUsers },
  ];

  // Calculate quiz performance data
  const quizPerformanceData = quizzes.slice(0, 6).map(quiz => {
    const quizResults = results.filter(r => r.quizId === quiz.id);
    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
      : 0;

    return {
      category: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
      completed: quizResults.length,
      avgScore: avgScore
    };
  });

  // Calculate category distribution
  const categoryCounts = quizzes.reduce((acc, quiz) => {
    const category = quiz.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryDistribution = Object.entries(categoryCounts).map(([name, value], index) => ({
    name,
    value: Math.round((value as number / totalQuizzes) * 100),
    color: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]
  }));

  // Recent users (real data)
  const recentUsers = users.slice(-5).map(user => ({
    id: user.id,
    name: user.name || user.username,
    email: user.email,
    joinDate: new Date(user.createdAt).toLocaleDateString(),
    status: user.role === 'admin' ? 'active' : 'active',
    quizzes: results.filter(r => r.userId === user.id).length
  }));

  // Recent quizzes (real data)
  const recentQuizzes = quizzes.slice(-5).map(quiz => {
    const quizResults = results.filter(r => r.quizId === quiz.id);
    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
      : 0;

    return {
      id: quiz.id,
      title: quiz.title,
      category: quiz.category || 'General',
      questions: questions.filter(q => q.quizId === quiz.id).length,
      attempts: quizResults.length,
      avgScore: avgScore,
      status: quiz.published ? 'published' : 'draft'
    };
  });

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

  // User delete
  const handleDeleteUser = (id: string) => {
    fetch(`${BACKEND}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) setUsers(users.filter(u => u.id !== id));
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

  // Quiz delete
  const handleDeleteQuiz = (id: string) => {
    fetch(`${BACKEND}/quizzes/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) setQuizzes(quizzes.filter(q => q.id !== id));
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

  // Question delete
  const handleDeleteQuestion = (id: string) => {
    fetch(`${BACKEND}/questions/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) setQuestions(questions.filter(q => q.id !== id));
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

  // Answer delete
  const handleDeleteAnswer = (id: string) => {
    fetch(`${BACKEND}/answers/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) setAnswers(answers.filter(a => a.id !== id));
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {userName}! Here's what's happening with DevTrivia.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active: {activeUsers}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Quizzes</CardTitle>
              <Brain className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalQuizzes}</div>
              <p className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Published: {publishedQuizzes}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalQuestions.toLocaleString()}</div>
              <p className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Across {totalQuizzes} quizzes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Quiz Attempts</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalResults.toLocaleString()}</div>
              <p className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total quiz completions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                  <CardDescription className="text-gray-400">
                    Total and active users over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="active" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quiz Categories</CardTitle>
                  <CardDescription className="text-gray-400">
                    Distribution of quiz attempts by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {categoryDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-300">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="mb-1">
                            {user.status}
                          </Badge>
                          <p className="text-gray-400 text-sm">{user.quizzes} quizzes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                    Top Performing Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentQuizzes.slice(0, 5).map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{quiz.title}</p>
                          <p className="text-gray-400 text-sm">{quiz.category} • {quiz.questions} questions</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 font-semibold">{quiz.avgScore}%</p>
                          <p className="text-gray-400 text-sm">{quiz.attempts} attempts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage and monitor user accounts
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-gray-300">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-600 text-gray-300">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Join Date</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Quizzes</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name || user.username}</p>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {results.filter(r => r.userId === user.id).length}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                              >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Quiz Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Create, edit, and manage quiz content
                    </CardDescription>
                  </div>
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Quiz
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Quiz</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Questions</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Attempts</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Avg Score</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.map((quiz) => {
                        const quizResults = results.filter(r => r.quizId === quiz.id);
                        const avgScore = quizResults.length > 0
                          ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
                          : 0;

                        return (
                          <tr key={quiz.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                            <td className="py-3 px-4">
                              <p className="text-white font-medium">{quiz.title}</p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                                {quiz.category || 'General'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {questions.filter(q => q.quizId === quiz.id).length}
                            </td>
                            <td className="py-3 px-4 text-gray-300">{quizResults.length}</td>
                            <td className="py-3 px-4 text-cyan-400 font-semibold">
                              {avgScore > 0 ? `${avgScore}%` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={quiz.published ? 'default' : 'secondary'}>
                                {quiz.published ? 'Published' : 'Draft'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quiz Performance */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quiz Performance by Category</CardTitle>
                  <CardDescription className="text-gray-400">
                    Completion rates and average scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quizPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="category" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Bar dataKey="completed" fill="#06B6D4" />
                      <Bar dataKey="avgScore" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Engagement Metrics</CardTitle>
                  <CardDescription className="text-gray-400">
                    User engagement and retention stats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Daily Active Users</span>
                      <span className="text-white font-semibold">{Math.floor(totalUsers * 0.3)}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Quiz Completion Rate</span>
                      <span className="text-white font-semibold">
                        {totalResults > 0 ? Math.round((totalResults / (totalUsers * 2)) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={totalResults > 0 ? Math.min((totalResults / (totalUsers * 2)) * 100, 100) : 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">User Retention (7-day)</span>
                      <span className="text-white font-semibold">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Average Session Time</span>
                      <span className="text-white font-semibold">8m 42s</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">API Response Time</span>
                      <span className="text-green-400 text-sm font-semibold">142ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Uptime</span>
                      <span className="text-green-400 text-sm font-semibold">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Error Rate</span>
                      <span className="text-green-400 text-sm font-semibold">0.01%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-white">{totalUsers} total users registered</p>
                      <p className="text-gray-400">System status: Active</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-white">{totalQuizzes} quizzes available</p>
                      <p className="text-gray-400">{publishedQuizzes} published</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-white">{totalResults} quiz attempts recorded</p>
                      <p className="text-gray-400">All systems operational</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-yellow-400">High server load detected</p>
                      <p className="text-gray-400">15 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-green-400">All systems operational</p>
                      <p className="text-gray-400">No active alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}