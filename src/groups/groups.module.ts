import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { InvitesModule } from 'src/invites/invites.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]), TasksModule, InvitesModule],
    controllers: [GroupsController],
    providers: [GroupsService],
    exports: [GroupsService],
})
export class GroupsModule { }
