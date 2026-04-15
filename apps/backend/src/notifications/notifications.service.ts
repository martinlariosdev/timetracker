import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationPayload {
  consultantId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  /**
   * Register a push token for a consultant
   * @param consultantId - ID of the consultant
   * @param token - Expo push token
   * @returns true if successful
   */
  async registerPushToken(
    consultantId: string,
    token: string,
  ): Promise<boolean> {
    try {
      // Validate token format
      if (!Expo.isExpoPushToken(token)) {
        this.logger.warn(`Invalid push token format: ${token}`);
        throw new Error('Invalid push token format');
      }

      // Update consultant with push token
      await this.prisma.consultant.update({
        where: { id: consultantId },
        data: { pushToken: token },
      });

      this.logger.log(`Push token registered for consultant ${consultantId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to register push token for consultant ${consultantId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send a push notification to a consultant
   * @param consultantId - ID of the consultant
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional additional data
   * @returns true if notification was sent successfully
   */
  async sendPushNotification(
    consultantId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Get consultant's push token
      const consultant = await this.prisma.consultant.findUnique({
        where: { id: consultantId },
        select: { pushToken: true, name: true },
      });

      if (!consultant?.pushToken) {
        this.logger.warn(
          `No push token found for consultant ${consultantId}. Skipping notification.`,
        );
        return false;
      }

      // Validate token
      if (!Expo.isExpoPushToken(consultant.pushToken)) {
        this.logger.warn(
          `Invalid push token for consultant ${consultantId}: ${consultant.pushToken}`,
        );
        return false;
      }

      // Prepare message
      const message: ExpoPushMessage = {
        to: consultant.pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      };

      // Send notification
      const tickets = await this.expo.sendPushNotificationsAsync([message]);

      // Log result
      const ticket = tickets[0];
      if (ticket.status === 'error') {
        this.logger.error(
          `Failed to send notification to ${consultant.name}:`,
          ticket.message,
        );
        return false;
      }

      this.logger.log(`Notification sent to ${consultant.name}: "${title}"`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending push notification to consultant ${consultantId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send push notifications to multiple consultants
   * @param notifications - Array of notification payloads
   * @returns Number of successfully sent notifications
   */
  async sendBulkNotifications(
    notifications: NotificationPayload[],
  ): Promise<number> {
    try {
      // Get all consultant tokens
      const consultantIds = notifications.map((n) => n.consultantId);
      const consultants = await this.prisma.consultant.findMany({
        where: { id: { in: consultantIds } },
        select: { id: true, pushToken: true, name: true },
      });

      // Create a map of consultant ID to token
      const tokenMap = new Map(
        consultants
          .filter((c) => c.pushToken && Expo.isExpoPushToken(c.pushToken))
          .map((c) => [c.id, c.pushToken!]),
      );

      // Prepare messages
      const messages: ExpoPushMessage[] = [];
      for (const notification of notifications) {
        const token = tokenMap.get(notification.consultantId);
        if (token) {
          messages.push({
            to: token,
            sound: 'default',
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
          });
        } else {
          this.logger.warn(
            `No valid push token for consultant ${notification.consultantId}. Skipping.`,
          );
        }
      }

      if (messages.length === 0) {
        this.logger.warn('No valid push tokens found. No notifications sent.');
        return 0;
      }

      // Send in chunks (Expo recommends max 100 per request)
      const chunks = this.expo.chunkPushNotifications(messages);
      let successCount = 0;

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);

          // Count successes
          for (const ticket of ticketChunk) {
            if (ticket.status === 'ok') {
              successCount++;
            } else if (ticket.status === 'error') {
              this.logger.error(`Push notification error:`, ticket.message);
            }
          }
        } catch (error) {
          this.logger.error('Error sending push notification chunk:', error);
        }
      }

      this.logger.log(
        `Bulk notifications sent: ${successCount}/${messages.length} successful`,
      );
      return successCount;
    } catch (error) {
      this.logger.error('Error sending bulk push notifications:', error);
      return 0;
    }
  }
}
