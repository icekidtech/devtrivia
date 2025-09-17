import ControlPanelClient from './ControlPanelClient';

export default async function QuizControlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ControlPanelClient quizId={id} />;
}