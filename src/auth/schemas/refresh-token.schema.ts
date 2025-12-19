import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
    @Prop({ required: true, index: true })
    token: string;

    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false, index: true })
    revoked: boolean;

    @Prop()
    revokedAt?: Date;

    createdAt?: Date;

    updatedAt?: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Create TTL index to automatically delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

