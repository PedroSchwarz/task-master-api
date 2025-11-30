import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { Model } from 'mongoose';
import CreateInviteDto from './dto/create_invite.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class InvitesService {
    constructor(@InjectModel(Invite.name) private inviteModel: Model<Invite>, private readonly notificationService: NotificationService) { }

    async getAll(): Promise<InviteDocument[]> {
        return this.inviteModel.find({}).populate(['to', 'from', 'group']).exec();
    }

    async getAllForUser(userId: string, status: string = 'all'): Promise<InviteDocument[]> {
        if (status === 'all') {
            return this.inviteModel.find({ to: userId }).populate(['from', 'group']).exec();
        }

        return (await this.inviteModel.find({ to: userId }).populate(['from', 'group']).exec()).filter(invite => invite.status === status);
    }

    async create(userId: string, createInviteDto: CreateInviteDto): Promise<void> {
        const invite = {
            from: userId,
            to: createInviteDto.to,
            group: createInviteDto.groupId,
        }
        const createdInvite = new this.inviteModel(invite);
        const savedInvite = await createdInvite.save();

        await this.notificationService.sendInviteNotification(createInviteDto.to, userId, savedInvite.id)
    }

    async delete(id: string): Promise<void> {
        await this.inviteModel.findByIdAndDelete(id).exec();
    }

    async deleteAllForGroup(groupId: string): Promise<void> {
        await this.inviteModel.deleteMany({ group: groupId }).exec();
    }

    async deleteAll(): Promise<void> {
        await this.inviteModel.deleteMany({}).exec();
    }
}
