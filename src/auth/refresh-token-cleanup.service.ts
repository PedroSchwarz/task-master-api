import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class RefreshTokenCleanupService implements OnModuleInit {
    private readonly logger = new Logger(RefreshTokenCleanupService.name);

    constructor(private readonly authService: AuthService) { }

    onModuleInit() {
        this.logger.log('RefreshTokenCleanupService initialized - Cleanup cron job is active');
    }

    /**
     * Runs daily at 2:00 AM UTC to clean up old revoked tokens.
     * Keeps revoked tokens for 7 days before deletion for audit purposes.
     */
    @Cron('0 2 * * *')
    async handleCleanupRevokedTokens() {
        this.logger.log('Running cleanup for revoked refresh tokens');
        try {
            const deletedCount = await this.authService.cleanupRevokedTokens(7);
            this.logger.log(`Cleaned up ${deletedCount} revoked refresh tokens`);
        } catch (error) {
            this.logger.error('Error cleaning up revoked refresh tokens', error);
        }
    }
}

