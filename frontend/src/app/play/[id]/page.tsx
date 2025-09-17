import { Suspense } from 'react';
import QuizPlayClient from './QuizPlayClient';

export const metadata = {
  title: 'Play Quiz | DevTrivia',
  description: 'Take a quiz and test your development knowledge.',
};

export default async function QuizPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-900 text-cyan-400">Loading quiz...</div>}>
      <QuizPlayClient quizId={id} />
    </Suspense>
  );
}