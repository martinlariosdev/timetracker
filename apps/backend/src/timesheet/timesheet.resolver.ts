import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { TimesheetService } from './timesheet.service';
import {
  TimeEntryType,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFiltersInput,
} from './dto';
import type { Consultant } from '@prisma/client';

/**
 * TimesheetResolver
 * Provides GraphQL API for time entry CRUD operations
 * All operations are protected by JWT authentication
 * Users can only access their own time entries
 */
@Resolver(() => TimeEntryType)
@UseGuards(JwtAuthGuard)
export class TimesheetResolver {
  constructor(private timesheetService: TimesheetService) {}

  /**
   * Query all time entries for the current user
   * Optional filters can be applied
   * @param filters - Optional filters for consultant, pay period, and date range
   * @param user - Current authenticated user
   * @returns Array of time entries
   */
  @Query(() => [TimeEntryType], { description: 'Get all time entries for the current user' })
  async timeEntries(
    @Args('filters', { nullable: true }) filters: TimeEntryFiltersInput,
    @CurrentUser() user: Consultant,
  ) {
    // Override consultantId to ensure users only see their own entries
    return this.timesheetService.findAll({
      ...filters,
      consultantId: user.id,
    });
  }

  /**
   * Query a single time entry by ID
   * Verifies that the entry belongs to the current user
   * @param id - Time entry ID
   * @param user - Current authenticated user
   * @returns Single time entry
   * @throws ForbiddenException if entry doesn't belong to user
   */
  @Query(() => TimeEntryType, { description: 'Get a single time entry by ID' })
  async timeEntry(
    @Args('id') id: string,
    @CurrentUser() user: Consultant,
  ) {
    const entry = await this.timesheetService.findOne(id);

    // Check authorization
    if (entry.consultantId !== user.id) {
      throw new ForbiddenException('You can only view your own time entries');
    }

    return entry;
  }

  /**
   * Create a new time entry
   * Automatically assigns the entry to the current user
   * @param input - Time entry data
   * @param user - Current authenticated user
   * @returns Created time entry
   */
  @Mutation(() => TimeEntryType, { description: 'Create a new time entry' })
  async createTimeEntry(
    @Args('input') input: CreateTimeEntryInput,
    @CurrentUser() user: Consultant,
  ) {
    // Force consultantId to be current user
    return this.timesheetService.create({
      ...input,
      consultantId: user.id,
    });
  }

  /**
   * Update an existing time entry
   * Verifies that the entry belongs to the current user
   * @param id - Time entry ID
   * @param input - Updated time entry data
   * @param user - Current authenticated user
   * @returns Updated time entry
   * @throws ForbiddenException if entry doesn't belong to user
   */
  @Mutation(() => TimeEntryType, { description: 'Update an existing time entry' })
  async updateTimeEntry(
    @Args('id') id: string,
    @Args('input') input: UpdateTimeEntryInput,
    @CurrentUser() user: Consultant,
  ) {
    const entry = await this.timesheetService.findOne(id);

    // Check authorization
    if (entry.consultantId !== user.id) {
      throw new ForbiddenException('You can only update your own time entries');
    }

    return this.timesheetService.update(id, input);
  }

  /**
   * Delete a time entry
   * Verifies that the entry belongs to the current user
   * @param id - Time entry ID
   * @param user - Current authenticated user
   * @returns Boolean indicating success
   * @throws ForbiddenException if entry doesn't belong to user
   */
  @Mutation(() => Boolean, { description: 'Delete a time entry' })
  async deleteTimeEntry(
    @Args('id') id: string,
    @CurrentUser() user: Consultant,
  ): Promise<boolean> {
    const entry = await this.timesheetService.findOne(id);

    // Check authorization
    if (entry.consultantId !== user.id) {
      throw new ForbiddenException('You can only delete your own time entries');
    }

    await this.timesheetService.delete(id);
    return true;
  }
}
