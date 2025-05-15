import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GroupsService } from 'src/groups/groups.service';
import { TasksService } from 'src/tasks/tasks.service';

@WebSocketGateway({ namespace: 'tasks-events', cors: { origin: '*' } })
export class TasksEventsGateway {
    constructor(private readonly taskService: TasksService, private readonly groupsService: GroupsService) { }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('task_updated')
    async handleTaskEvent(@MessageBody('userId') userId: string, @MessageBody('taskId') taskId: string): Promise<any> {
        const task = await this.taskService.getById(taskId);
        if (!task) {
            return;
        }
        const group = await this.groupsService.getById(task.group.toString());

        if (!group) {
            return;
        }
        const members = group.members.filter((member) => member.id != userId).map((member) => member.id);

        if (members.length == 0) {
            return;
        }

        this.server.emit('update_task', members as string[]);
    }

    @SubscribeMessage('tasks_updated')
    handleTasksEvent(@MessageBody('members') members: string[]): any {
        this.server.emit('update_tasks', members as string[]);
    }
}