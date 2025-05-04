import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import CreateGroupDto from './dto/create_group.dto';

@Injectable()
export class GroupsService {
    constructor(@InjectModel(Group.name) private groupModel: Model<Group>) { }

    async getAll(): Promise<GroupDocument[]> {
        return this.groupModel.find({}).exec();
    }

    async getAllForUser(userId: string): Promise<GroupDocument[]> {
        return this.groupModel.find({ members: userId }).populate('members').populate('owner').exec();
    }

    async create(userId: string, createGroupDto: CreateGroupDto): Promise<string> {
        const group = {
            name: createGroupDto.name,
            description: createGroupDto.description,
            owner: userId,
            members: [userId],
        }
        const createdGroup = new this.groupModel(group);
        await createdGroup.save();
        return createdGroup.id;
    }

    async addUser(groupId: string, userId: string): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, { $push: { members: userId } }).exec();
        return;
    }

    async delete(id: string): Promise<void> {
        await this.groupModel.findByIdAndDelete(id).exec();
    }

    async deleteAll(): Promise<void> {
        await this.groupModel.deleteMany({}).exec();
    }
}
