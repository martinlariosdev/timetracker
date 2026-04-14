import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TimesheetService } from './timesheet/timesheet.service';
import { TimesheetResolver } from './timesheet/timesheet.resolver';
import { SubmissionService } from './timesheet/submission.service';
import { SubmissionResolver } from './timesheet/submission.resolver';

/**
 * Timesheet Module
 * Provides time entry management and timesheet functionality
 * Contains resolvers and services for time tracking and submission workflow
 */
@Module({
  imports: [PrismaModule],
  providers: [
    TimesheetService,
    TimesheetResolver,
    SubmissionService,
    SubmissionResolver,
  ],
  exports: [TimesheetService, SubmissionService],
})
export class TimesheetModule {}
