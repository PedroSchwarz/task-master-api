import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from 'src/users/users.service';
import { format } from 'date-fns';
import CreateTaskDto from 'src/tasks/dto/create_task.dto';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly usersService: UsersService,
    ) { }

    async sendTaskAssignmentNotification(
        memberId: string,
        ownerId: string,
        taskId: string,
        taskDto: CreateTaskDto,
    ): Promise<boolean> {
        try {
            const assignedUser = await this.usersService.findOneById(memberId);

            if (!assignedUser || !assignedUser.deviceToken) {
                this.logger.warn(`No device token found for user ${assignedUser.id} - ${assignedUser.email}`);
                return false;
            }

            const assignedByUser = await this.usersService.findOneById(ownerId);
            const assignerName = assignedByUser?.firstName;

            const title = 'New Task Assigned';
            const formattedDueDate = format(taskDto.dueDate, 'dd/MM/yyyy HH:mm');
            const body = `${assignerName} assigned you task: ${taskDto.title} with a due date of: ${formattedDueDate}`;

            const data = {
                taskId: taskId,
                groupId: taskDto.group,
                type: 'TASK_ASSIGNMENT',
                priority: taskDto.priority || 'low',
                dueDate: taskDto.dueDate ? String(taskDto.dueDate) : '',
            };

            return await this.firebaseService.sendNotification(
                assignedUser.deviceToken,
                title,
                body,
                data,
            );
        } catch (error) {
            this.logger.error(`Error sending task assignment notification: ${error.message}`, error.stack);
            return false;
        }
    }
}