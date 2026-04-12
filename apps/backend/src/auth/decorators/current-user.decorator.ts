import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Consultant } from '../../generated';

/**
 * Decorator to extract the currently authenticated consultant from the request.
 *
 * @remarks
 * This decorator requires the JwtAuthGuard to be applied to the resolver/controller.
 * The consultant is attached to the request by the JWT strategy after successful authentication.
 *
 * @throws {UnauthorizedException} If no authenticated user is found in the request
 *
 * @example
 * ```typescript
 * @Query(() => String)
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() consultant: Consultant) {
 *   return consultant.name;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): Consultant => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user) {
      throw new UnauthorizedException(
        'No authenticated user found. Ensure JwtAuthGuard is applied.',
      );
    }

    return user;
  },
);
