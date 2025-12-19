import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { RefreshTokenCleanupService } from './refresh-token-cleanup.service';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
    JwtModule.register({ global: true, secret: jwtConstants.secret, signOptions: { expiresIn: '14 days' } })
  ],
  providers: [AuthService, RefreshTokenCleanupService]
})
export class AuthModule { }
