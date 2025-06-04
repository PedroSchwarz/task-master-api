import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChecklistItemDocument = HydratedDocument<ChecklistItem>;

@Schema({ timestamps: true })
export class ChecklistItem {
    @Prop({ required: true })
    title: string;

    @Prop({ default: 'incomplete' })
    status: string;

    @Prop({ required: true })
    order: number;
}

export const ChecklistItemSchema = SchemaFactory.createForClass(ChecklistItem);
