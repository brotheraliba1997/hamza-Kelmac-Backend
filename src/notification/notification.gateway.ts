import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3001',
      'https://kelmac-frontend-kelmac-dev.vercel.app',
      'https://kelmac-frontend.vercel.app',
      'https://kelmac-dashboard-g33j.vercel.app',
      'https://kelmac-dashboard.vercel.app',
    ],
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, client: Socket) {
    console.log('Message received from client:', client.id, data);
    // Echo back to the client
    client.emit('message', {
      message: 'Message received successfully',
      originalData: data,
      timestamp: new Date().toISOString(),
    });
    return { status: 'ok' };
  }
}
  