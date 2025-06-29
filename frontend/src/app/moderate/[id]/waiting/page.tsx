import WaitingRoomClient from './WaitingRoomClient';

export default async function WaitingRoomPage({ params }: { params: { id: string } }) {
  await params; // Ensure params is awaited
  return <WaitingRoomClient quizId={params.id} />;
}