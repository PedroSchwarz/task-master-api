import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Group } from 'src/groups/schemas/group.schema';
import { User } from 'src/users/schemas/user.schema';

export type InviteDocument = HydratedDocument<Invite>;

@Schema()
export class Invite {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    from: User;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    to: User;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
    group: Group;

    @Prop({ default: Date.now() })
    createdAt: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);