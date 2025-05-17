import { Module } from '@nestjs/common';
import { TasksEventsGateway } from './tasks.events.gateway';
import { CommentsEventsGateway } from './comments.events.gateway';
import { GroupsEventsGateway } from './groups.events.gateway';

@Module({
    providers: [TasksEventsGateway, CommentsEventsGateway, GroupsEventsGateway],
})
export class EventsModule { }
