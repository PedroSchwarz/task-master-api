import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from './groups/groups.module';
import { InvitesModule } from './invites/invites.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { FirebaseModule } from './firebase/firebase.module';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL') ?? '';
        const name = config.get<string>('DATABASE_NAME') ?? '';
        const user = config.get<string>('DATABASE_USER') ?? '';
        const password = config.get<string>('DATABASE_PASSWORD') ?? '';
        return { uri: `mongodb+srv://${user}:${password}@${url}/?retryWrites=true&w=majority&appName=${name}` };
      }
    }),
    GroupsModule,
    InvitesModule,
    TasksModule,
    CommentsModule,
    FirebaseModule,
    NotificationModule,
    EventsModule,
  ],
  providers: [NotificationService],
})
export class AppModule { }
