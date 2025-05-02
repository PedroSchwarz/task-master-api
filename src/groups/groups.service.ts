import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import CreateGroupDto from './dto/create_group.dto';

@Injectable()
export class GroupsService {
    constructor(@InjectModel(Group.name) private groupModel: Model<Group>) { }

    async getAllForUser(userId: string): Promise<GroupDocument[]> {
        return this.groupModel.find({ members: userId }).populate('members').exec();
    }

    async create(userId: string, createGroupDto: CreateGroupDto): Promise<GroupDocument> {
        const group = {
            name: createGroupDto.name,
            description: createGroupDto.description,
            owner: userId,
            members: [userId],
        }
        const createdGroup = new this.groupModel(group);
        return createdGroup.save();
    }

    async addUser(groupId: string, userId: string): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, { $push: { members: userId } }).exec();
        return;
    }

    async deleteAll(): Promise<any> {
        return this.groupModel.deleteMany({}).exec();
    }
}
