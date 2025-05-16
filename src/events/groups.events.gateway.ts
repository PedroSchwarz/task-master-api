import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'groups-events', cors: { origin: '*' } })
export class GroupsEventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('groups_updated')
    handleGroupsEvent(@MessageBody('groupId') groupId): any {
        this.server.emit('update_groups', groupId);
    }
}