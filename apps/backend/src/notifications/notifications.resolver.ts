import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { RegisterPushTokenInput, TestNotificationInput } from './dto';
import type { Consultant } from '../generated';

/**
 * NotificationsResolver
 * Provides GraphQL API for push notification operations
 * All operations are protected by JWT authentication
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Register a push token for the current user
   * @param input - Push token input
   * @param user - Current authenticated user
   * @returns true if successful
   */
  @Mutation(() => Boolean, {
    description: 'Register a push notification token for the current user',
  })
  async registerPushToken(
    @Args('input') input: RegisterPushTokenInput,
    @CurrentUser() user: Consultant,
  ): Promise<boolean> {
    return this.notificationsService.registerPushToken(user.id, input.token);
  }

  /**
   * Send a test notification to the current user
   * Useful for testing push notification setup
   * @param input - Test notification input
   * @param user - Current authenticated user
   * @returns true if notification was sent successfully
   */
  @Mutation(() => Boolean, {
    description: 'Send a test push notification to the current user',
  })
  async testNotification(
    @Args('input') input: TestNotificationInput,
    @CurrentUser() user: Consultant,
  ): Promise<boolean> {
    return this.notificationsService.sendPushNotification(
      user.id,
      input.title,
      input.body,
      { test: true },
    );
  }
}
