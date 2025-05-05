import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schema/task.schema';
import { Model } from 'mongoose';
import CreateTaskDto from './dto/create_task.dto';

@Injectable()
export class TasksService {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) { }

    async getAllForGroup(groupId: string): Promise<TaskDocument[]> {
        return this.taskModel.find({ group: groupId }).populate(['owner', 'assignedTo']).exec();
    }

    async create(userId: string, createTaskDto: CreateTaskDto): Promise<void> {
        const task = {
            title: createTaskDto.title,
            description: createTaskDto.description,
            priority: createTaskDto.priority,
            status: createTaskDto.status,
            dueDate: createTaskDto.dueDate,
            group: createTaskDto.group,
            owner: userId,
            assignedTo: createTaskDto.assignedTo,
        }
        const createdTask = new this.taskModel(task);
        await createdTask.save();
    }

    // async addUser(groupId: string, userId: string): Promise<void> {
    //     await this.taskModel.findByIdAndUpdate(groupId, { $push: { members: userId } }).exec();
    //     return;
    // }

    // async delete(id: string): Promise<void> {
    //     await this.taskModel.findByIdAndDelete(id).exec();
    // }

    // async deleteAll(): Promise<void> {
    //     await this.taskModel.deleteMany({}).exec();
    // }
}
