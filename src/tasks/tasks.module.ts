import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schema/task.schema';
import { CommentsModule } from 'src/comments/comments.module';
import { NotificationModule } from 'src/notification/notification.module';
import { TaskCheckerService } from './task-checker.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), CommentsModule, NotificationModule],
  providers: [TasksService, TaskCheckerService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule { }
