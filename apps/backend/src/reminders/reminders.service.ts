import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

interface NotificationPreferences {
  deadlineReminders?: boolean;
  submissionConfirmations?: boolean;
  approvalNotifications?: boolean;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Send timesheet reminders on the 5th of every month at 9:00 AM
   * Deadline: 7th of the month
   */
  @Cron('0 9 5 * *')
  async sendFirstPeriodReminders() {
    this.logger.log('Running first period timesheet reminders (5th of month)');
    await this.sendTimesheetReminders('7th');
  }

  /**
   * Send timesheet reminders on the 20th of every month at 9:00 AM
   * Deadline: 22nd of the month
   */
  @Cron('0 9 20 * *')
  async sendSecondPeriodReminders() {
    this.logger.log('Running second period timesheet reminders (20th of month)');
    await this.sendTimesheetReminders('22nd');
  }

  /**
   * Main method to send timesheet reminders
   * @param deadlineDay - The day of the month when timesheet is due (e.g., "7th", "22nd")
   */
  async sendTimesheetReminders(deadlineDay: string): Promise<void> {
    try {
      // Calculate the deadline date
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const deadlineDate = new Date(
        year,
        month,
        deadlineDay === '7th' ? 7 : 22,
      );

      // Get the current pay period
      const currentPayPeriod = await this.prisma.payPeriod.findFirst({
        where: { isCurrent: true },
      });

      if (!currentPayPeriod) {
        this.logger.warn('No current pay period found. Skipping reminders.');
        return;
      }

      // Find all consultants who:
      // 1. Have a push token registered
      // 2. Have notifications enabled (check notificationPreferences)
      // 3. Have incomplete timesheets (no submission or draft status)
      const consultants = await this.prisma.consultant.findMany({
        where: {
          pushToken: { not: null },
        },
        select: {
          id: true,
          name: true,
          pushToken: true,
          notificationPreferences: true,
          workingHoursPerPeriod: true,
          timesheetSubmissions: {
            where: {
              payPeriodId: currentPayPeriod.id,
            },
            select: {
              status: true,
            },
          },
          timeEntries: {
            where: {
              payPeriodId: currentPayPeriod.id,
            },
            select: {
              totalHours: true,
            },
          },
        },
      });

      // Filter consultants who need reminders
      const consultantsNeedingReminders = consultants.filter((consultant) => {
        // Check notification preferences - respect opt-out
        const prefs = consultant.notificationPreferences as NotificationPreferences | null;
        if (prefs && prefs.timesheetReminders === false) {
          this.logger.debug(
            `Consultant ${consultant.name} has opted out of timesheet reminders`,
          );
          return false;
        }

        // Check if timesheet is incomplete
        const submission = consultant.timesheetSubmissions[0];
        const isIncomplete =
          !submission ||
          submission.status === 'draft' ||
          submission.status === 'rejected';

        if (!isIncomplete) {
          this.logger.debug(
            `Consultant ${consultant.name} has already submitted timesheet`,
          );
          return false;
        }

        return true;
      });

      this.logger.log(
        `Found ${consultantsNeedingReminders.length} consultants needing timesheet reminders`,
      );

      // Send notifications
      let successCount = 0;
      for (const consultant of consultantsNeedingReminders) {
        try {
          const totalHours = consultant.timeEntries.reduce(
            (sum, entry) => sum + entry.totalHours,
            0,
          );

          const body =
            totalHours === 0
              ? `Your timesheet is due on the ${deadlineDay}. You haven't logged any hours yet.`
              : `Your timesheet is due on the ${deadlineDay}. Please review and submit before the deadline.`;

          const success = await this.notificationsService.sendPushNotification(
            consultant.id,
            'Timesheet Reminder',
            body,
            {
              type: 'timesheet_reminder',
              dueDate: deadlineDate.toISOString().split('T')[0],
              payPeriodId: currentPayPeriod.id,
            },
          );

          if (success) {
            successCount++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to send reminder to consultant ${consultant.name}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Timesheet reminders sent: ${successCount}/${consultantsNeedingReminders.length} successful`,
      );
    } catch (error) {
      this.logger.error('Error in sendTimesheetReminders:', error);
      throw error;
    }
  }
}
