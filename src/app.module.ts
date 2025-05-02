import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [AuthModule, UsersModule, MongooseModule.forRoot('mongodb://admin:secret@localhost:27017/task-master?authSource=admin'), GroupsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
