import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Timesheet Module
 * Provides time entry management and timesheet functionality
 * Contains resolvers and services for time tracking operations
 */
@Module({
  imports: [PrismaModule],
})
export class TimesheetModule {}
