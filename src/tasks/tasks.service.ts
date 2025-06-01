import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schema/task.schema';
import { Model } from 'mongoose';
import CreateTaskDto from './dto/create_task.dto';
import UpdateTaskDto from './dto/update_task.dto';
import { CommentsService } from 'src/comments/comments.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<Task>,
        private readonly commentsService: CommentsService,
        private readonly notificationService: NotificationService
    ) { }

    async getAllForGroup(groupId: string): Promise<TaskDocument[]> {
        return this.taskModel.find({ group: groupId }).populate(['owner', 'assignedTo']).exec();
    }

    async getAllForAssigned(userId: string): Promise<TaskDocument[]> {
        return this.taskModel.find({ assignedTo: userId }).exec();
    }

    async getAllForOwner(userId: string): Promise<TaskDocument[]> {
        return this.taskModel.find({ owner: userId }).exec();
    }

    async getTasksClosestToOverdue(userId: string): Promise<TaskDocument[]> {
        const now = new Date();

        return this.taskModel
            .find({
                assignedTo: userId,
                completed: false,
                dueDate: { $gte: now }
            })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate(['owner', 'assignedTo'])
            .exec();
    }

    async getRecentlyOverdueTasks(userId: string, daysBack: number = 7): Promise<TaskDocument[]> {
        const now = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysBack);

        return this.taskModel
            .find({
                assignedTo: userId,
                completed: false,
                dueDate: {
                    $lt: now,
                    $gte: cutoffDate
                }
            })
            .sort({ dueDate: -1 })
            .limit(5)
            .populate(['owner', 'assignedTo'])
            .exec();
    }

    async findTasksDueBetween(start: Date, end: Date): Promise<TaskDocument[]> {
        return this.taskModel.find({ dueDate: { $gte: start, $lt: end }, completed: false }).exec();
    }

    async getById(id: string): Promise<TaskDocument> {
        const task = await this.taskModel.findById(id).populate(['owner', 'assignedTo']).exec();

        if (!task) {
            throw new NotFoundException();
        }

        return task;
    }

    async create(userId: string, createTaskDto: CreateTaskDto): Promise<string> {
        const task = {
            title: createTaskDto.title,
            description: createTaskDto.description,
            priority: createTaskDto.priority,
            status: createTaskDto.status,
            dueDate: createTaskDto.dueDate,
            group: createTaskDto.group,
            owner: userId,
            assignedTo: createTaskDto.assignedTo,
        };

        const createdTask = new this.taskModel(task);
        const savedTask = await createdTask.save();

        const assignees = [...new Set(createTaskDto.assignedTo)];

        if (!assignees || assignees.filter((assignee) => assignee != userId).length == 0) {
            return savedTask.id;
        }

        await Promise.all(
            assignees
                .filter((assignee) => assignee !== userId)
                .map((id) =>
                    this.notificationService.sendTaskAssignmentNotification(id, userId, savedTask.id, createTaskDto)
                )
        );

        return savedTask.id;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<void> {
        const task = { ...updateTaskDto };

        await this.taskModel.findByIdAndUpdate(id, task).exec();
    }

    async delete(id: string): Promise<void> {
        await this.taskModel.findByIdAndDelete(id).exec();
        await this.commentsService.deleteAllForTask(id);
    }

    async deleteAllForUserOnGroup(groupId: string, userId: string): Promise<void> {
        await this.taskModel.deleteMany({ group: groupId, owner: userId }).exec();

        const tasks = await this.taskModel.find({ group: groupId, assignedTo: userId }).exec();

        for (const task of tasks) {
            await this.taskModel.findByIdAndUpdate(task.id, { $pull: { assignedTo: userId } }).exec();
        }
    }

    async deleteAllForGroup(groupId: string): Promise<void> {
        const tasks = await this.getAllForGroup(groupId);
        await this.taskModel.deleteMany({ group: groupId }).exec();
        await Promise.all(tasks.map(task => this.commentsService.deleteAllForTask(task.id)));
    }

    async deleteAll(): Promise<void> {
        await this.taskModel.deleteMany({}).exec();
    }
}
