"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Brain, 
  Users, 
  Trophy, 
  Zap, 
  Code, 
  Sparkles, 
  Timer, 
  BarChart3,
  Shield,
  Smartphone,
  BookOpen,
  Target
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Intelligent Quiz Engine",
    description: "AI-powered question selection that adapts to your interests and keeps the fun going.",
    highlights: ["Smart matching", "Personalized content", "Dynamic difficulty"],
  },
  {
    icon: Users,
    title: "Live Multiplayer Action",
    description: "Join friends and players worldwide in exciting real-time quiz battles, just like Kahoot!",
    highlights: ["Real-time play", "Global competitions", "Team battles"],
  },
  {
    icon: Trophy,
    title: "Rewards & Achievements",
    description: "Earn badges, unlock achievements, and show off your quiz mastery to friends.",
    highlights: ["100+ achievements", "Leaderboards", "Bragging rights"],
  },
  {
    icon: Timer,
    title: "Fast-Paced Fun",
    description: "Feel the excitement with timed questions and lightning-fast quiz rounds.",
    highlights: ["Speed rounds", "Time pressure", "Instant results"],
  },
  {
    icon: Code,
    title: "Endless Topics",
    description: "Explore hundreds of categories from science to pop culture - there's something for everyone!",
    highlights: ["500+ categories", "Custom topics", "Trending quizzes"],
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description: "Track your quiz journey with detailed stats and see how you stack up against friends.",
    highlights: ["Personal stats", "Friend comparisons", "Progress tracking"],
  },
  {
    icon: Shield,
    title: "Fair Play Guaranteed",
    description: "Advanced anti-cheat technology ensures everyone has a fair and fun experience.",
    highlights: ["Anti-cheat system", "Fair competition", "Secure gaming"],
  },
  {
    icon: Smartphone,
    title: "Play Anywhere",
    description: "Perfect experience on any device - phone, tablet, or computer. Quiz on the go!",
    highlights: ["Mobile-first", "Cross-platform", "Offline mode"],
  },
  {
    icon: BookOpen,
    title: "Learn While Playing",
    description: "Get explanations and fun facts with every question to learn something new.",
    highlights: ["Educational content", "Fun facts", "Learning mode"],
  },
  {
    icon: Target,
    title: "Create & Share",
    description: "Build your own quizzes on any topic and share them with the world.",
    highlights: ["Easy quiz builder", "Share anywhere", "Community quizzes"],
  },
  {
    icon: Sparkles,
    title: "Web3 Innovation",
    description: "Experience the future of gaming with blockchain rewards and NFT achievements.",
    highlights: ["Crypto rewards", "NFT badges", "Decentralized"],
  },
  {
    icon: Zap,
    title: "Instant Everything",
    description: "Lightning-fast gameplay with instant responses and real-time updates.",
    highlights: ["Zero lag", "Instant feedback", "Smooth gameplay"],
  },
];

export default function Features() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUserRole(userData.role);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handlePlayNowClick = () => {
    if (isLoggedIn) {
      // Redirect to appropriate dashboard based on user role
      const dashboardRoute = userRole ? `/${userRole.toLowerCase()}/dashboard` : '/user/dashboard';
      router.push(dashboardRoute);
    } else {
      // Redirect to login with return URL
      router.push('/login?redirect=/features');
    }
  };

  const handleCreateQuizClick = () => {
    if (isLoggedIn) {
      // For creating quizzes, redirect to moderator dashboard if user is moderator or admin
      if (userRole === 'moderator' || userRole === 'admin') {
        router.push('/moderator/dashboard');
      } else {
        // Regular users can't create quizzes, redirect to their dashboard
        router.push('/user/dashboard');
      }
    } else {
      // Redirect to login with return URL
      router.push('/login?redirect=/features');
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Powerful Features for <span className="text-cyan-400">Quiz Fun</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover all the features that make DevTrivia the ultimate quiz platform for 
            learning, competing, and having fun with friends and players worldwide.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <feature.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.highlights.map((highlight, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Popular Quiz Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Science", "History", "Geography", "Movies", "Music", "Sports",
              "Literature", "Art", "Technology", "Nature", "Food", "Travel",
              "Pop Culture", "Gaming", "Animals", "Space", "Health", "Politics",
              "Business", "Math", "Languages", "Philosophy", "Psychology", "Fashion",
            ].map((category) => (
              <div 
                key={category} 
                className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 text-center hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-gray-300 font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-cyan-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Your Quiz Adventure Today
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Join thousands of quiz enthusiasts who are already having amazing experiences with DevTrivia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handlePlayNowClick}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Play Now'}
              </button>
              <button 
                onClick={handleCreateQuizClick}
                className="border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
              >
                {isLoggedIn && (userRole === 'moderator' || userRole === 'admin') ? 'Create Quiz' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}