import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Users, Trophy, Zap, Code, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-cyan-400">DevTrivia</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            DevTrivia is a real-time, interactive quiz platform inspired by Kahoot. 
            Create, play, and share quizzes on any topic. Challenge friends, compete with others, and learn while having fun!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              size="lg" 
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 text-lg"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white px-8 py-3 text-lg"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose DevTrivia?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the ultimate quiz platform with features designed for fun, learning, and friendly competition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Brain className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Diverse Topics</h3>
              <p className="text-gray-300">
                Explore quizzes on countless topics - from science and history to pop culture and sports. Something for everyone!
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Live Multiplayer Fun</h3>
              <p className="text-gray-300">
                Join friends and players worldwide in exciting real-time quiz battles. Just like Kahoot, but even better!
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Trophy className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Achievement System</h3>
              <p className="text-gray-300">
                Earn badges, unlock achievements, and track your progress as you master different quiz categories.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300">
                Optimized for speed with instant feedback and seamless gameplay experience across all devices.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Your Own</h3>
              <p className="text-gray-300">
                Create custom quizzes on any topic you love. Share with friends, classmates, or the entire community.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Code className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Web3 Powered</h3>
              <p className="text-gray-300">
                Built on cutting-edge Web3 technology for a decentralized, secure, and innovative quiz experience.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-cyan-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Have Some Fun?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of quiz enthusiasts who are already having a blast with DevTrivia.
            </p>
            <Button 
              asChild
              size="lg" 
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 text-lg"
            >
              <Link href="/signup">Start Your First Quiz</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}