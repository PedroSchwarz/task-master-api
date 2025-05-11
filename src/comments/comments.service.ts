import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import CreateCommentDto from './dto/create_comment.dto';

@Injectable()
export class CommentsService {
    constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) { }

    async getAllForTask(taskId: string): Promise<CommentDocument[]> {
        return this.commentModel.find({ task: taskId }).populate(['owner']).exec();
    }

    async getById(id: string): Promise<CommentDocument> {
        const comment = await this.commentModel.findById(id).populate(['owner']).exec();

        if (!comment) {
            throw new NotFoundException();
        }

        return comment;
    }

    async create(userId: string, createCommentDto: CreateCommentDto): Promise<void> {
        const comment = {
            message: createCommentDto.message,
            task: createCommentDto.task,
            owner: userId,
        };

        const createdComment = new this.commentModel(comment);
        await createdComment.save();
    }

    async delete(id: string): Promise<void> {
        await this.commentModel.findByIdAndDelete(id).exec();
    }

    async deleteAll(): Promise<void> {
        await this.commentModel.deleteMany({}).exec();
    }
}
