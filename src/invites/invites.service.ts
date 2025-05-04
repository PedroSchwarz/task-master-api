import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { Model } from 'mongoose';
import CreateInviteDto from './dto/create_invite.dto';

@Injectable()
export class InvitesService {
    constructor(@InjectModel(Invite.name) private inviteModel: Model<Invite>) { }

    async getAll(): Promise<InviteDocument[]> {
        return this.inviteModel.find({}).populate('to').populate('from').populate('group').exec();
    }

    async getAllForUser(userId: string): Promise<InviteDocument[]> {
        return this.inviteModel.find({ to: userId }).populate('from').populate('group').exec();
    }

    async create(userId: string, createInviteDto: CreateInviteDto): Promise<void> {
        const invite = {
            from: userId,
            to: createInviteDto.to,
            group: createInviteDto.groupId,
        }
        const createdGroup = new this.inviteModel(invite);
        await createdGroup.save();
        return;
    }

    async delete(id: string): Promise<void> {
        await this.inviteModel.findByIdAndDelete(id).exec();
    }

    async deleteAll(): Promise<void> {
        await this.inviteModel.deleteMany({}).exec();
    }
}
