import QuizResultsClient from './QuizResultsClient';

export const metadata = {
  title: 'Quiz Results | DevTrivia',
  description: 'Review your quiz results and see detailed analytics.',
};

export default async function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizResultsClient resultId={id} />;
}