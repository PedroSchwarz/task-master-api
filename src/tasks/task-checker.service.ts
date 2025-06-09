import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import * as dayjs from 'dayjs';
import { NotificationService } from 'src/notification/notification.service';
import { Task } from './schema/task.schema';

@Injectable()
export class TaskCheckerService {
    private readonly logger = new Logger(TaskCheckerService.name);

    constructor(
        private readonly tasksService: TasksService,
        private readonly notificationService: NotificationService
    ) { }

    // Runs every day at 00:00
    @Cron('0 0 * * *')
    async handleOverdueNotificationCron() {
        const now = dayjs().toDate();

        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        const upcomingTasks = await this.tasksService.findTasksDueBetween(now, end);

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

    // Runs every day at 00:00
    @Cron('0 0 * * *')
    async handleRecurringTasks() {
        const now = dayjs();
        const yesterday = now.subtract(1, 'day').toDate();

        const tasks = await this.tasksService.getRecurringTasksByDate(yesterday);

        for (const task of tasks) {
            if (this.shouldDuplicate(task)) {
                const newDueDate = new Date(task.dueDate);
                switch (task.recurrencePattern) {
                    case 'daily':
                        newDueDate.setDate(newDueDate.getDate() + 1);
                        break;
                    case 'weekly':
                        newDueDate.setDate(newDueDate.getDate() + 7);
                        break;
                    case 'monthly':
                        newDueDate.setMonth(newDueDate.getMonth() + 1);
                        break;
                }

                await this.tasksService.create(task.owner.toString(), {
                    title: task.title,
                    description: task.description,
                    dueDate: newDueDate,
                    checklist: task.checklist,
                    group: task.group.toString(),
                    assignedTo: task.assignedTo.map(id => id.toString()),
                    recurring: task.recurring,
                    recurrencePattern: task.recurrencePattern,
                    recurrenceEndDate: task.recurrenceEndDate,
                });
            }
        }
    }

    private shouldDuplicate(task: Task): boolean {
        const now = dayjs();

        if (task.recurrenceEndDate && now.toDate() > task.recurrenceEndDate) {
            return false;
        }

        switch (task.recurrencePattern) {
            case 'daily':
                return true;
            case 'weekly':
                return true;
            case 'monthly':
                return true;
            default:
                return false;
        }
    }
}