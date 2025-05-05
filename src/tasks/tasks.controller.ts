import { Controller, Get, Post, UseGuards, Request, Body, Param } from '@nestjs/common';
import { TaskDocument } from './schema/task.schema';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import CreateTaskDto from './dto/create_task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @UseGuards(AuthGuard)
    @Get('/group/:groupId')
    async getAllForGroup(@Param('groupId') groupId: string): Promise<TaskDocument[]> {
        return this.tasksService.getAllForGroup(groupId);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createTask(@Request() req, @Body() createTaskDto: CreateTaskDto): Promise<void> {
        return this.tasksService.create(req.user.sub, createTaskDto);
    }

}
