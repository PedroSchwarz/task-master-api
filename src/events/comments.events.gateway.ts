import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'comments-events', cors: { origin: '*' } })
export class CommentsEventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('comments_updated')
    handleCommentsEvent(@MessageBody('taskId') taskId: string): any {
        this.server.emit('update_comments', taskId);
    }
}