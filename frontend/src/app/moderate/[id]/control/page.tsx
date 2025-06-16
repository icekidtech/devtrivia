import ControlPanelClient from './ControlPanelClient';

export default function QuizControlPage({ params }: { params: { id: string } }) {
  return <ControlPanelClient quizId={params.id} />;
}