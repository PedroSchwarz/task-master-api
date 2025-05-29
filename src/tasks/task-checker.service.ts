import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import * as dayjs from 'dayjs';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TaskCheckerService {
    private readonly logger = new Logger(TaskCheckerService.name);

    constructor(
        private readonly tasksService: TasksService,
        private readonly notificationService: NotificationService
    ) { }

    // Runs every day at 00:00
    @Cron('0 0 * * *')
    async handleCron() {
        const now = dayjs();
        const tomorrow = now.add(1, 'day');

        const upcomingTasks = await this.tasksService.findTasksDueBetween(now.toDate(), tomorrow.toDate());

        for (const task of upcomingTasks) {
            if (!task) {
                return;
            }

            await this.notificationService.sendTaskExpiresSoonNotification(task.owner.id, task.id, task.group.toString(), task.title, task.dueDate);

            for (const user of task.assignedTo) {
                await this.notificationService.sendTaskExpiresSoonNotification(user.id, task.id, task.group.toString(), task.title, task.dueDate);
            }
        }
    }
}