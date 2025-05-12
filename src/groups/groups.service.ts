import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import CreateGroupDto from './dto/create_group.dto';
import UpdateGroupDto from './dto/update_group.dto';

@Injectable()
export class GroupsService {
    constructor(@InjectModel(Group.name) private groupModel: Model<Group>) { }

    async getAll(): Promise<GroupDocument[]> {
        return this.groupModel.find({}).exec();
    }

    async getAllForUser(userId: string): Promise<GroupDocument[]> {
        return this.groupModel.find({ members: userId }).populate(['members', 'owner']).exec();
    }

    async getById(id: string): Promise<GroupDocument> {
        const group = await this.groupModel.findById(id).populate(['members', 'owner']).exec();

        if (!group) {
            throw new NotFoundException();
        }

        return group;
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

    async update(id: string, updateGroupDto: UpdateGroupDto) {
        const group = { ...updateGroupDto };

        await this.groupModel.findByIdAndUpdate(id, group).exec();
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
