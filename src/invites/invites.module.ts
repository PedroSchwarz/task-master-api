import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './schemas/invite.schema';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]), GroupsModule],
  providers: [InvitesService],
  exports: [InvitesService],
  controllers: [InvitesController],
})
export class InvitesModule { }
