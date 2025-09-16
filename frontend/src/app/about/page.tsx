import { Card } from "@/components/ui/card";
import { Target, Heart, Lightbulb, Globe, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            About Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            DevTrivia is a revolutionary quiz platform inspired by Kahoot, designed for everyone who loves 
            learning and having fun. Built on Web3 technology for the next generation of interactive entertainment.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-gray-300 text-center leading-relaxed">
              Our mission is to create a global community where learning meets entertainment. Whether you're a 
              student, teacher, trivia lover, or just someone who enjoys a good challenge, DevTrivia has something 
              for everyone! We believe that learning should be interactive, social, and most importantly, fun.
            </p>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Heart className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fun First</h3>
              <p className="text-gray-300">
                We prioritize fun and engagement in everything we do, making learning an enjoyable experience for all.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Inclusive Community</h3>
              <p className="text-gray-300">
                Building a welcoming community where people of all backgrounds can learn, play, and grow together.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Lightbulb className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-gray-300">
                Leveraging Web3 technology and innovative features to create the future of interactive learning.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-lg mb-4">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Accessibility</h3>
              <p className="text-gray-300">
                Making quality educational entertainment accessible to everyone, everywhere, regardless of background.
              </p>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                DevTrivia was born from our love for Kahoot and the belief that learning should be as exciting as 
                playing your favorite game. We saw the potential to create something even better - a platform that 
                combines the fun of Kahoot with the innovation of Web3 technology.
              </p>
              <p className="leading-relaxed">
                We envisioned a platform where anyone could create, share, and play quizzes on topics they're passionate 
                about. Whether it's testing your friends on movie trivia, helping students study for exams, or just 
                having fun with random facts - DevTrivia makes it all possible.
              </p>
              <p className="leading-relaxed">
                Today, DevTrivia serves thousands of quiz enthusiasts worldwide, from students and teachers to trivia 
                lovers and casual players, all united by the joy of learning and friendly competition.
              </p>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-cyan-400 mb-2">50K+</div>
            <div className="text-gray-300">Quiz Players</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-cyan-400 mb-2">100K+</div>
            <div className="text-gray-300">Quiz Questions</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-cyan-400 mb-2">500+</div>
            <div className="text-gray-300">Categories</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="text-3xl font-bold text-cyan-400 mb-2">1M+</div>
            <div className="text-gray-300">Games Played</div>
          </div>
        </div>
      </div>
    </div>
  );
}