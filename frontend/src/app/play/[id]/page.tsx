import { Suspense } from 'react';
import QuizPlayClient from './QuizPlayClient';

export const metadata = {
  title: 'Play Quiz | DevTrivia',
  description: 'Take a quiz and test your development knowledge.',
};

export default function QuizPlayPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-900 text-cyan-400">Loading quiz...</div>}>
      <QuizPlayClient quizId={params.id} />
    </Suspense>
  );
}