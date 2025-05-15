import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);

    async sendNotification(
        userFcmToken: string,
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<boolean> {
        try {
            if (!userFcmToken) {
                this.logger.warn('No FCM token provided for user');
                return false;
            }

            const message: admin.messaging.Message = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                token: userFcmToken,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'task-assignments',
                    },
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                            contentAvailable: true,
                        },
                    },
                },
            };

            const response = await admin.messaging().send(message);
            this.logger.log(`Notification sent successfully: ${response}`);
            return true;
        } catch (error) {
            this.logger.error(`Error sending notification: ${error.message}`, error.stack);
            return false;
        }
    }

    async sendMulticastNotification(
        userFcmTokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<admin.messaging.BatchResponse | null> {
        try {
            const validTokens = userFcmTokens.filter(token => !!token);

            if (validTokens.length === 0) {
                this.logger.warn('No valid FCM tokens provided');
                return null;
            }

            const message: admin.messaging.MulticastMessage = {
                notification: {
                    title,
                    body,
                },
                data: data || {},
                tokens: validTokens,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'task-assignments',
                    },
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                            contentAvailable: true,
                        },
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            this.logger.log(
                `Multicast notification sent: ${response.successCount} successful, ${response.failureCount} failed`
            );
            return response;
        } catch (error) {
            this.logger.error(`Error sending multicast notification: ${error.message}`, error.stack);
            return null;
        }
    }
}
