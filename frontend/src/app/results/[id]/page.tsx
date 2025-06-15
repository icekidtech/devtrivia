import QuizResultsClient from './QuizResultsClient';

export const metadata = {
  title: 'Quiz Results | DevTrivia',
  description: 'Review your quiz results and see detailed analytics.',
};

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  return <QuizResultsClient resultId={params.id} />;
}