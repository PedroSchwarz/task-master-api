import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from './groups/groups.module';
import { InvitesModule } from './invites/invites.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [AuthModule, UsersModule, MongooseModule.forRoot('mongodb://admin:secret@localhost:27017/task-master?authSource=admin'), GroupsModule, InvitesModule, TasksModule, CommentsModule],
})
export class AppModule { }
