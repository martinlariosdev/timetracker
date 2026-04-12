import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TimesheetService } from './timesheet/timesheet.service';

/**
 * Timesheet Module
 * Provides time entry management and timesheet functionality
 * Contains resolvers and services for time tracking operations
 */
@Module({
  imports: [PrismaModule],
  providers: [TimesheetService],
  exports: [TimesheetService],
})
export class TimesheetModule {}
