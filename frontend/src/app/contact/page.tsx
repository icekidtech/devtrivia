"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions about DevTrivia? Need help with your quizzes? Or just want to share feedback? 
            We&apos;d love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/10 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Email Us</h3>
                </div>
                <p className="text-gray-300 mb-2">General inquiries:</p>
                <p className="text-cyan-400">hello@devtrivia.com</p>
                <p className="text-gray-300 mt-2 mb-2">Support:</p>
                <p className="text-cyan-400">support@devtrivia.com</p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/10 rounded-lg mr-3">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Available 24/7 for all your quiz questions and support needs
                </p>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white w-full">
                  Start Chat
                </Button>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/10 rounded-lg mr-3">
                    <Phone className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Phone</h3>
                </div>
                <p className="text-cyan-400 mb-2">+1 (555) 123-4567</p>
                <p className="text-gray-300 text-sm">
                  Available for urgent support and partnership inquiries
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/10 rounded-lg mr-3">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Office</h3>
                </div>
                <p className="text-gray-300">
                  123 Quiz Avenue<br />
                  San Francisco, CA 94102<br />
                  United States
                </p>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold w-full md:w-auto px-8"
                >
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How do I join a quiz game?
              </h3>
              <p className="text-gray-300">
                Simply enter the game PIN provided by the quiz host, choose your nickname, and you&apos;re ready to play!
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I create custom quizzes?
              </h3>
              <p className="text-gray-300">
                Absolutely! Anyone can create custom quizzes on any topic. Use our easy quiz builder 
                and share with friends or the community.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is DevTrivia free to use?
              </h3>
              <p className="text-gray-300">
                Yes! DevTrivia is free to play. Create an account to save your progress, create quizzes, 
                and unlock special features as you play.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What makes DevTrivia different from Kahoot?
              </h3>
              <p className="text-gray-300">
                DevTrivia combines the fun of Kahoot with Web3 innovation, offering crypto rewards, 
                NFT achievements, and a more diverse range of quiz topics and formats.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}