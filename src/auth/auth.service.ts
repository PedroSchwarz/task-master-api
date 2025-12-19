import { ConflictException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import CredentialsDto from './dto/credentials.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import RefreshTokenDto from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>
    ) { }

    async register(registerDto: RegisterDto): Promise<CredentialsDto> {
        const foundUser = await this.usersService.findOneByEmail(registerDto.email);

        if (foundUser) {
            throw new ConflictException();
        }

        const createdUser = await this.usersService.create(registerDto);

        if (!createdUser) {
            throw new HttpException('Something went wrong', 400);
        }

        return this.getUserCredentials(createdUser.id, createdUser.firstName, createdUser.lastName, createdUser.email, createdUser.createdAt ?? new Date());
    }

    async login(loginDto: LoginDto): Promise<CredentialsDto> {
        const user = await this.usersService.findOneByEmail(loginDto.email);

        if (!user) {
            throw new NotFoundException();
        }

        const doesPasswordMatch = await bcrypt.compare(loginDto.password, user.password);

        if (!doesPasswordMatch) {
            throw new UnauthorizedException();
        }

        return this.getUserCredentials(user.id, user.firstName, user.lastName, user.email, user.createdAt ?? new Date());
    }

    async getUserCredentials(id: string, firstName: string, lastName: string, email: string, createdAt: Date): Promise<CredentialsDto> {
        const payload = { sub: id, username: email };

        // Generate access token (short-lived, 15 minutes)
        const access_token = await this.jwtService.signAsync(payload);

        // Generate and store refresh token (long-lived, 7 days)
        const refresh_token = await this.generateRefreshToken(id);

        return {
            id,
            access_token,
            refresh_token,
            firstName,
            lastName,
            email,
            createdAt
        };
    }

    private async generateRefreshToken(userId: string): Promise<string> {
        // Revoke all existing refresh tokens for this user
        await this.refreshTokenModel.updateMany(
            { userId, revoked: false },
            { revoked: true, revokedAt: new Date() }
        );

        // Generate a secure random token
        const token = randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365); // 1 year from now

        // Store the refresh token in the database
        const refreshToken = new this.refreshTokenModel({
            token,
            userId,
            expiresAt,
            revoked: false
        });

        await refreshToken.save();

        return token;
    }

    async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<CredentialsDto> {
        const { refresh_token } = refreshTokenDto;

        // Find the refresh token in the database
        const storedToken = await this.refreshTokenModel.findOne({
            token: refresh_token,
            revoked: false
        }).exec();

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Check if token is expired
        if (new Date() > storedToken.expiresAt) {
            // Mark as revoked
            storedToken.revoked = true;
            await storedToken.save();
            throw new UnauthorizedException('Refresh token has expired');
        }

        // Get user information
        const user = await this.usersService.findOneById(storedToken.userId);

        // Generate new access token
        const payload = { sub: user.id, username: user.email };
        const access_token = await this.jwtService.signAsync(payload);

        // Optionally generate a new refresh token (refresh token rotation)
        // For security, you might want to rotate refresh tokens
        const new_refresh_token = await this.generateRefreshToken(user.id);

        return {
            id: user.id,
            access_token,
            refresh_token: new_refresh_token,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt ?? new Date()
        };
    }

    async revokeRefreshToken(refreshToken: string): Promise<void> {
        await this.refreshTokenModel.updateOne(
            { token: refreshToken },
            { revoked: true, revokedAt: new Date() }
        );
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenModel.updateMany(
            { userId, revoked: false },
            { revoked: true, revokedAt: new Date() }
        );
    }

    /**
     * Clean up old revoked tokens from the database.
     * This should be called periodically (e.g., via a scheduled task).
     * @param retentionDays Number of days to keep revoked tokens before deletion (default: 7 days)
     */
    async cleanupRevokedTokens(retentionDays: number = 7): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await this.refreshTokenModel.deleteMany({
            revoked: true,
            revokedAt: { $lt: cutoffDate }
        }).exec();

        return result.deletedCount || 0;
    }

    /**
     * Delete revoked tokens immediately (no retention period).
     * Use this if you don't need audit trail for revoked tokens.
     */
    async deleteRevokedTokensImmediately(): Promise<number> {
        const result = await this.refreshTokenModel.deleteMany({
            revoked: true
        }).exec();

        return result.deletedCount || 0;
    }
}
