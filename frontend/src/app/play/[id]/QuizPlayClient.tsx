'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Quiz, Question, Answer, User } from '@/types';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, XCircle, Award } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function QuizPlayClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(3); // Countdown before starting quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null); // Track question start time

  // Load user and quiz data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login?redirect=/play/' + quizId);
          return;
        }
        
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Fetch quiz data
        const res = await fetch(`${BACKEND}/quizzes/${quizId}`);
        if (!res.ok) {
          throw new Error(`Quiz not found or not available (${res.status})`);
        }
        
        const quizData = await res.json();
        
        // Check if quiz is published
        if (!quizData.published) {
          throw new Error('This quiz is not currently available');
        }
        
        // Ensure questions are included
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          throw new Error('This quiz has no questions');
        }
        
        // Randomize questions order
        const randomizedQuestions = [...quizData.questions].sort(() => Math.random() - 0.5);
        quizData.questions = randomizedQuestions;
        
        setQuiz(quizData);
        setTimeRemaining(quizData.questions.length * (quizData.timePerQuestion || 20)); // Use quiz setting or default to 20 seconds
        setIsLoading(false);
        
        // Start countdown
        setTimeout(() => startQuiz(), 3000);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the quiz');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [quizId, router]);
  
  // Countdown timer to start quiz
  useEffect(() => {
    if (isLoading || quizStarted) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      startQuiz();
    }
  }, [countdown, isLoading, quizStarted]);
  
  // Start quiz and begin timer
  const startQuiz = () => {
    setQuizStarted(true);
  };
  
  // Timer for quiz
  useEffect(() => {
    if (!quizStarted || !timeRemaining || quizSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, quizSubmitted]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle answer selection
  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
    });
  };
  
  // Update answer selection logic to record time spent
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    if (!questionStartTime) return;
    
    const timeSpent = Date.now() - questionStartTime;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId,
      [`${questionId}_time`]: timeSpent // Store time spent
    }));
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Submit quiz answers
  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;
    
    try {
      setQuizSubmitted(true);
      
      const questionCount = quiz.questions.length;
      let correctCount = 0;
      
      // Calculate score locally
      quiz.questions.forEach(question => {
        const selectedAnswerId = selectedAnswers[question.id];
        if (selectedAnswerId) {
          const correctAnswer = question.answers.find(answer => answer.isCorrect);
          if (correctAnswer && selectedAnswerId === correctAnswer.id) {
            correctCount++;
          }
        }
      });
      
      const score = Math.round((correctCount / questionCount) * 100);
      
      // Submit result to backend
      const resultResponse = await fetch(`${BACKEND}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          quizId: quiz.id,
          score,
          totalQuestions: questionCount,
          correctAnswers: correctCount,
          timeSpent: selectedAnswers[`${currentQuestion.id}_time`] || 20000, // Make sure this is included
          answers: selectedAnswers
        }),
      });
      
      if (!resultResponse.ok) {
        throw new Error('Failed to submit quiz results');
      }
      
      const resultData = await resultResponse.json();
      
      setResults({
        score,
        totalQuestions: questionCount,
        correctAnswers: correctCount,
        incorrectAnswers: questionCount - correctCount
      });
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz results');
    }
  };
  
  // Current question
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  
  // Add this safety check at the start of your render function
  if (!quiz || !quiz.questions) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading quiz data...</div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900">
        <div className="animate-pulse text-cyan-400 text-2xl">Loading quiz...</div>
      </div>
    );
  }
  
  // Show error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 px-4">
        <div className="text-red-400 mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
        <Link 
          href="/user/dashboard"
          className="bg-cyan-400/20 text-cyan-400 px-6 py-2 rounded-md hover:bg-cyan-400/30 transition mt-4"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  // Quiz not found or not available
  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 px-4">
        <div className="text-red-400 mb-4">Quiz not found or not available</div>
        <Link 
          href="/user/dashboard"
          className="bg-cyan-400/20 text-cyan-400 px-6 py-2 rounded-md hover:bg-cyan-400/30 transition mt-4"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  // Show countdown screen
  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 px-4">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">{quiz.title}</h1>
        <div className="text-6xl font-bold text-white mb-8 animate-pulse">{countdown}</div>
        <p className="text-gray-300">Quiz starting soon...</p>
      </div>
    );
  }
  
  // Show results
  if (quizSubmitted && results) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-200 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#2D2D44] p-8 rounded-lg border border-cyan-400/20 shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-8">
              <span className="text-cyan-400">Quiz</span>
              <span className="text-fuchsia-500"> Results</span>
            </h1>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-cyan-400/10 border-4 border-cyan-400 mb-4">
                <span className="text-3xl font-bold text-cyan-400">{results.score}%</span>
              </div>
              <h2 className="text-xl font-semibold">{quiz.title}</h2>
              <p className="text-gray-400">Completed</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-cyan-400/10 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="text-lime-400 mr-2" size={20} />
                  <span>Correct</span>
                </div>
                <div className="text-2xl font-bold text-lime-400">{results.correctAnswers}</div>
              </div>
              <div className="bg-cyan-400/10 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="text-red-400 mr-2" size={20} />
                  <span>Incorrect</span>
                </div>
                <div className="text-2xl font-bold text-red-400">{results.incorrectAnswers}</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link
                href="/user/dashboard"
                className="bg-cyan-400 text-slate-900 px-6 py-3 rounded-md font-semibold hover:bg-cyan-500 transition"
              >
                Back to Dashboard
              </Link>
              <Link
                href={`/results/${quizId}`}
                className="bg-fuchsia-500/20 text-fuchsia-500 px-6 py-3 rounded-md font-semibold border border-fuchsia-500/30 hover:bg-fuchsia-500/30 transition"
              >
                View Detailed Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz play UI
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Timer and progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="text-sm font-medium">Quiz:</span>
            <span className="ml-2 text-cyan-400 font-medium">{quiz.title}</span>
          </div>
          
          {timeRemaining !== null && (
            <div className={`flex items-center ${
              timeRemaining < 10 
                ? 'text-red-400 animate-pulse font-bold' 
                : timeRemaining < 30 
                  ? 'text-amber-400' 
                  : 'text-gray-300'
            }`}>
              <Clock size={18} className="mr-1" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700/30 h-2 mb-8 rounded-full overflow-hidden">
          <div 
            className="bg-cyan-400 h-full rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Question card */}
        <div className="bg-[#2D2D44] p-6 rounded-lg border border-cyan-400/20 shadow-lg mb-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-300">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </h2>
            {Object.keys(selectedAnswers).length === quiz.questions.length && !quizSubmitted && (
              <button
                onClick={handleSubmitQuiz}
                className="bg-lime-500 text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-lime-600 transition"
              >
                Submit All Answers
              </button>
            )}
          </div>
          
          {currentQuestion && (
            <div>
              <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>
              
              <div className="space-y-3">
                {currentQuestion.answers.map((answer) => (
                  <button
                    key={answer.id}
                    onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                    className={`w-full text-left p-4 rounded-md transition border ${
                      selectedAnswers[currentQuestion.id] === answer.id
                        ? 'bg-cyan-400/20 border-cyan-400 text-cyan-100'
                        : 'bg-[#3A3A55] border-transparent hover:bg-[#404060]'
                    }`}
                  >
                    {answer.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentQuestionIndex === 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
            }`}
          >
            <ChevronLeft size={20} className="mr-1" />
            Previous
          </button>
          
          <div className="flex items-center">
            {Object.keys(selectedAnswers).length}/{quiz.questions.length} answered
          </div>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="flex items-center px-4 py-2 rounded-md bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30"
            >
              Next
              <ChevronRight size={20} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={quizSubmitted}
              className="flex items-center px-4 py-2 rounded-md bg-lime-500 text-slate-900 hover:bg-lime-600"
            >
              Finish Quiz
              <CheckCircle size={20} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}