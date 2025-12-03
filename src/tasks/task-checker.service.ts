import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import * as dayjs from 'dayjs';
import { NotificationService } from 'src/notification/notification.service';
import { Task } from './schema/task.schema';

@Injectable()
export class TaskCheckerService implements OnModuleInit {
    private readonly logger = new Logger(TaskCheckerService.name);

    constructor(
        private readonly tasksService: TasksService,
        private readonly notificationService: NotificationService
    ) { }

    onModuleInit() {
        this.logger.log('TaskCheckerService initialized - Cron jobs are active');
    }

    // Runs every day at 00:00 UTC
    @Cron('0 0 * * *')
    async handleOverdueNotificationCron() {
        this.logger.log('Running handleOverdueNotificationCron');
        const now = dayjs();

        const start = now.startOf('day').toDate(); // Start of today (00:00:00.000)
        const end = now.endOf('day').toDate(); // End of today (23:59:59.999)

        const upcomingTasks = await this.tasksService.findTasksDueBetween(start, end);
        this.logger.log(`Found ${upcomingTasks.length} tasks due today`);

        for (const task of upcomingTasks) {
            if (!task) {
                this.logger.warn('Skipping null task');
                continue;
            }

            try {
                // Ensure owner ID is converted to string (handles both populated and unpopulated cases)
                const ownerId = typeof task.owner === 'object' && task.owner?.id
                    ? task.owner.id.toString()
                    : task.owner.toString();

                await this.notificationService.sendTaskExpiresSoonNotification(
                    ownerId,
                    task.id.toString(),
                    task.group.toString(),
                    task.title,
                    task.dueDate
                );

                for (const user of task.assignedTo) {
                    // Ensure user ID is converted to string (handles both populated and unpopulated cases)
                    const userId = typeof user === 'object' && user?.id
                        ? user.id.toString()
                        : user.toString();

                    await this.notificationService.sendTaskExpiresSoonNotification(
                        userId,
                        task.id.toString(),
                        task.group.toString(),
                        task.title,
                        task.dueDate
                    );
                }
            } catch (error) {
                this.logger.error(`Error processing task ${task.id}: ${error.message}`, error.stack);
            }
        }
        this.logger.log('Completed handleOverdueNotificationCron');
    }

    // TEST: Runs every 2 minutes - Remove this after testing!
    @Cron('*/2 * * * *')
    async handleOverdueNotificationCronTest() {
        this.logger.log('Running handleRecurringTasks (TEST)');
        const now = dayjs();
        const tomorrow = now.add(1, 'day').toDate();

        const tasks = await this.tasksService.getRecurringTasksByDate(tomorrow);
        this.logger.log(`Found ${tasks.length} recurring tasks to process`);

        for (const task of tasks) {
            if (!task) {
                this.logger.warn('Skipping null task');
                continue;
            }

            if (this.shouldDuplicate(task)) {
                try {
                    // Use dayjs for timezone-safe date calculations
                    let newDueDate = dayjs(task.dueDate);
                    switch (task.recurrencePattern) {
                        case 'daily':
                            newDueDate = newDueDate.add(1, 'day');
                            break;
                        case 'weekly':
                            newDueDate = newDueDate.add(1, 'week');
                            break;
                        case 'monthly':
                            newDueDate = newDueDate.add(1, 'month');
                            break;
                    }

                    // Extract owner and assignedTo IDs (they're ObjectIds, not populated)
                    const ownerId = task.owner.toString();
                    const assignedToIds = task.assignedTo.map(id => id.toString());

                    await this.tasksService.create(ownerId, {
                        title: task.title,
                        description: task.description,
                        dueDate: newDueDate.toDate(),
                        checklist: task.checklist,
                        group: task.group.toString(),
                        assignedTo: assignedToIds,
                        recurring: task.recurring,
                        recurrencePattern: task.recurrencePattern,
                        recurrenceEndDate: task.recurrenceEndDate,
                    });
                    this.logger.log(`Created recurring task: ${task.title}`);
                } catch (error) {
                    this.logger.error(`Error creating recurring task ${task.id}: ${error.message}`, error.stack);
                }
            }
        }
        this.logger.log('Completed handleRecurringTasks');
    }

    // Runs every day at 00:00 UTC
    @Cron('0 0 * * *')
    async handleRecurringTasks() {
        this.logger.log('Running handleRecurringTasks');
        const now = dayjs().toDate();

        const tasks = await this.tasksService.getRecurringTasksByDate(now);
        this.logger.log(`Found ${tasks.length} recurring tasks to process`);

        for (const task of tasks) {
            if (!task) {
                this.logger.warn('Skipping null task');
                continue;
            }

            if (this.shouldDuplicate(task)) {
                try {
                    // Use dayjs for timezone-safe date calculations
                    let newDueDate = dayjs(task.dueDate);
                    switch (task.recurrencePattern) {
                        case 'daily':
                            newDueDate = newDueDate.add(1, 'day');
                            break;
                        case 'weekly':
                            newDueDate = newDueDate.add(1, 'week');
                            break;
                        case 'monthly':
                            newDueDate = newDueDate.add(1, 'month');
                            break;
                    }

                    // Extract owner and assignedTo IDs (they're ObjectIds, not populated)
                    const ownerId = task.owner.toString();
                    const assignedToIds = task.assignedTo.map(id => id.toString());

                    await this.tasksService.create(ownerId, {
                        title: task.title,
                        description: task.description,
                        dueDate: newDueDate.toDate(),
                        checklist: task.checklist,
                        group: task.group.toString(),
                        assignedTo: assignedToIds,
                        recurring: task.recurring,
                        recurrencePattern: task.recurrencePattern,
                        recurrenceEndDate: task.recurrenceEndDate,
                    });
                    this.logger.log(`Created recurring task: ${task.title}`);
                } catch (error) {
                    this.logger.error(`Error creating recurring task ${task.id}: ${error.message}`, error.stack);
                }
            }
        }
        this.logger.log('Completed handleRecurringTasks');
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