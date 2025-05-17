import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'tasks-events', cors: { origin: '*' } })
export class TasksEventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('tasks_updated')
    handleTasksEvent(@MessageBody('taskId') taskId: string): any {
        this.server.emit('update_tasks', taskId);
    }
}