import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Group } from 'src/groups/schemas/group.schema';
import { Task } from 'src/tasks/schema/task.schema';
import { User } from 'src/users/schemas/user.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true })
    message: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Task' })
    task: Task;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner: User;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);