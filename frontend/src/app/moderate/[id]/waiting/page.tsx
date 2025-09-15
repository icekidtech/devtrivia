import WaitingRoomClient from './WaitingRoomClient';

export default function WaitingRoomPage({ params }: { params: { id: string } }) {
  return <WaitingRoomClient quizId={params.id} />;
}