import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class QuizGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinQuiz')
  handleJoinQuiz(@MessageBody() data: { quizId: string; userId: string }) {
    this.server.to(data.quizId).emit('userJoined', { userId: data.userId });
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(@MessageBody() data: { quizId: string; userId: string; answer: string }) {
    this.server.to(data.quizId).emit('answerSubmitted', { userId: data.userId, answer: data.answer });
  }
}