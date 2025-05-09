import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Group } from 'src/groups/schemas/group.schema';
import { User } from 'src/users/schemas/user.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ default: 'medium' })
    priority: string;

    @Prop({ default: 'todo' })
    status: string;

    @Prop({ required: true })
    dueDate: Date;

    @Prop({ default: false })
    completed: boolean;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
    group: Group;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner: User;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
    assignedTo: User[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);