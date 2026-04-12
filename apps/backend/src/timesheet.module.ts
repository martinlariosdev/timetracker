import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TimesheetService } from './timesheet/timesheet.service';
import { TimesheetResolver } from './timesheet/timesheet.resolver';

/**
 * Timesheet Module
 * Provides time entry management and timesheet functionality
 * Contains resolvers and services for time tracking operations
 */
@Module({
  imports: [PrismaModule],
  providers: [TimesheetService, TimesheetResolver],
  exports: [TimesheetService],
})
export class TimesheetModule {}
