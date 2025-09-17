import WaitingRoomClient from './WaitingRoomClient';

export default async function WaitingRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WaitingRoomClient quizId={id} />;
}