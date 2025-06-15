import QuizPlayClient from './QuizPlayClient';

export const metadata = {
  title: 'Play Quiz | DevTrivia',
  description: 'Take a quiz and test your development knowledge.',
};

export default function QuizPlayPage({ params }: { params: { id: string } }) {
  return <QuizPlayClient quizId={params.id} />;
}