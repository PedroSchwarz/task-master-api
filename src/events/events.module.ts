import { Module } from '@nestjs/common';
import { TasksEventsGateway } from './tasks.events.gateway';
import { TasksModule } from 'src/tasks/tasks.module';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
    providers: [TasksEventsGateway],
    imports: [TasksModule, GroupsModule]
})
export class EventsModule { }
