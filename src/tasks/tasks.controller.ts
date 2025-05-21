import { Controller, Get, Post, UseGuards, Request, Body, Param, Put, Delete } from '@nestjs/common';
import { TaskDocument } from './schema/task.schema';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import CreateTaskDto from './dto/create_task.dto';
import UpdateTaskDto from './dto/update_task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @UseGuards(AuthGuard)
    @Get('/group/:groupId')
    async getAllForGroup(@Param('groupId') groupId: string): Promise<TaskDocument[]> {
        return this.tasksService.getAllForGroup(groupId);
    }

    @UseGuards(AuthGuard)
    @Get('/user/assigned')
    async getAllForAssignedUser(@Request() req): Promise<TaskDocument[]> {
        return this.tasksService.getAllForAssigned(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get('/user/owner')
    async getAllForOwner(@Request() req): Promise<TaskDocument[]> {
        return this.tasksService.getAllForOwner(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getTaskById(@Param('id') id: string): Promise<TaskDocument> {
        return this.tasksService.getById(id);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createTask(@Request() req, @Body() createTaskDto: CreateTaskDto): Promise<string> {
        return this.tasksService.create(req.user.sub, createTaskDto);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<void> {
        return this.tasksService.update(id, updateTaskDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteTask(@Param('id') id: string): Promise<void> {
        return this.tasksService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.tasksService.deleteAll();
    }
}
