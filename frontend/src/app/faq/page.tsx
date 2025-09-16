"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I join a quiz game?",
        answer: "Simply enter the game PIN provided by the quiz host, choose your nickname, and you're ready to play! No account required for basic gameplay."
      },
      {
        question: "Is DevTrivia free to use?",
        answer: "Yes! DevTrivia is completely free to play. Create an account to save your progress, create custom quizzes, and unlock special Web3 features like NFT achievements."
      },
      {
        question: "What topics can I find quizzes about?",
        answer: "DevTrivia covers 500+ categories including science, history, pop culture, movies, music, sports, geography, literature, technology, and much more. There's something for everyone!"
      },
      {
        question: "Can I use DevTrivia on mobile devices?",
        answer: "Absolutely! DevTrivia is fully responsive and optimized for mobile devices. You can take quizzes on your smartphone or tablet with the same great experience."
      }
    ]
  },
  {
    category: "Playing Quizzes",
    questions: [
      {
        question: "How do I create my own quiz?",
        answer: "Use our easy quiz builder! Click 'Create Quiz', choose your topic, add questions and answers, set the difficulty, and share with friends or publish to the community."
      },
      {
        question: "How does multiplayer work?",
        answer: "Join live multiplayer sessions where you compete against other players in real-time. Answer questions quickly and accurately to climb the leaderboard and earn bonus points!"
      },
      {
        question: "What are the different game modes?",
        answer: "We offer Classic mode (like Kahoot), Speed rounds, Team battles, Solo practice, and special Web3 tournaments with crypto rewards. More modes coming soon!"
      },
      {
        question: "What happens if I get a question wrong?",
        answer: "No worries! Wrong answers are part of the fun. You'll see the correct answer with interesting explanations and fun facts to help you learn something new."
      }
    ]
  },
  {
    category: "Rewards & Achievements",
    questions: [
      {
        question: "How is my score calculated?",
        answer: "Your score is based on correct answers, response time, and question difficulty. Faster correct answers earn more points, plus bonus points for streaks and special achievements!"
      },
      {
        question: "What are NFT achievements?",
        answer: "NFT achievements are unique digital badges you earn for special accomplishments. These blockchain-based rewards can be collected, traded, and showcase your quiz mastery across the Web3 ecosystem."
      },
      {
        question: "How do crypto rewards work?",
        answer: "Participate in special tournaments and challenges to earn cryptocurrency rewards. The more you play and the better you perform, the more you can earn!"
      },
      {
        question: "How do leaderboards work?",
        answer: "Leaderboards rank players based on points earned in different time periods (daily, weekly, monthly) and categories. Compete globally, with friends, or in special community groups."
      }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I'm having trouble logging in. What should I do?",
        answer: "First, try resetting your password using the 'Forgot Password' link. If that doesn't work, clear your browser cache and cookies, or try a different browser. Contact support if the issue persists."
      },
      {
        question: "The quiz isn't loading properly. How can I fix this?",
        answer: "Check your internet connection and try refreshing the page. Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge). If problems continue, contact our technical support team."
      },
      {
        question: "Can I use DevTrivia offline?",
        answer: "DevTrivia requires an internet connection for multiplayer features, but we offer offline mode for solo practice with downloaded quizzes. Perfect for playing on the go!"
      },
      {
        question: "How do I report a bug or technical issue?",
        answer: "Use the 'Contact' page to report bugs or technical issues. Include as much detail as possible: what you were doing, what browser you're using, and any error messages you saw."
      }
    ]
  },
  {
    category: "Account & Privacy",
    questions: [
      {
        question: "How do I change my password?",
        answer: "Go to your account settings and click 'Change Password'. You'll need to enter your current password and then set a new one. We recommend using a strong, unique password."
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account from the account settings page. Note that this action is permanent and will remove all your progress, achievements, NFTs, and quiz history."
      },
      {
        question: "What data does DevTrivia collect?",
        answer: "We collect basic account information, quiz performance data, and gameplay analytics to improve our service. Your Web3 wallet data is secured by blockchain technology. See our Privacy Policy for details."
      },
      {
        question: "How do I update my profile information?",
        answer: "Visit your profile settings to update your name, email, bio, and profile picture. Changes are saved automatically and will be reflected across the platform."
      }
    ]
  },
  {
    category: "Web3 & Special Features",
    questions: [
      {
        question: "What Web3 features does DevTrivia offer?",
        answer: "DevTrivia offers NFT achievements, cryptocurrency rewards, blockchain-based leaderboards, and decentralized quiz ownership. Connect your Web3 wallet to access these features."
      },
      {
        question: "Do I need a crypto wallet to play?",
        answer: "No! You can play DevTrivia without any crypto wallet. Web3 features are optional and enhance the experience with rewards and special achievements for those who want them."
      },
      {
        question: "How do I earn cryptocurrency?",
        answer: "Participate in special tournaments, achieve high rankings in competitive modes, and complete special challenges. Rewards are distributed automatically to your connected wallet."
      },
      {
        question: "Can I trade my NFT achievements?",
        answer: "Yes! NFT achievements can be traded on supported marketplaces. Some rare achievements from special events or tournaments can become quite valuable in the community."
      }
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full">
              <HelpCircle className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about DevTrivia. Can't find what you're looking for? 
            <a href="/contact" className="text-cyan-400 hover:text-cyan-300 ml-1">Contact our support team</a>.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems[key];
                  
                  return (
                    <Card key={questionIndex} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                      <Collapsible>
                        <CollapsibleTrigger 
                          onClick={() => toggleItem(key)}
                          className="w-full px-6 py-4 text-left hover:bg-slate-800/70 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white pr-4">
                              {faq.question}
                            </h3>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-6 pb-4">
                          <p className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-300 mb-6">
              Our support team is here to help! Get in touch and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                Contact Support
              </button>
              <button className="border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}