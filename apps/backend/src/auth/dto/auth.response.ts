import { ObjectType, Field, Float } from '@nestjs/graphql';

/**
 * User object type returned in authentication responses.
 * Contains consultant profile information.
 */
@ObjectType()
export class UserType {
  @Field(() => String, { description: 'Internal consultant ID' })
  id: string;

  @Field(() => String, { description: 'External Okta user ID' })
  externalId: string;

  @Field(() => String, { description: 'Consultant name' })
  name: string;

  @Field(() => String, { description: 'Consultant email' })
  email: string;

  @Field(() => Float, { description: 'Current ETO (Extended Time Off) balance in hours' })
  etoBalance: number;

  @Field(() => Float, { nullable: true, description: 'Standard working hours per pay period' })
  workingHoursPerPeriod?: number;

  @Field(() => String, { nullable: true, description: 'Payment type (e.g., contract, hourly)' })
  paymentType?: string;
}

/**
 * Authentication response object type.
 * Returned after successful login with JWT token and user data.
 */
@ObjectType()
export class AuthResponse {
  @Field(() => String, { description: 'JWT access token for authentication' })
  accessToken: string;

  @Field(() => String, { description: 'Token expiration time (e.g., "7d")' })
  expiresIn: string;

  @Field(() => UserType, { description: 'Authenticated user information' })
  user: UserType;
}

/**
 * Token response object type.
 * Returned by token refresh operations.
 */
@ObjectType()
export class TokenResponse {
  @Field(() => String, { description: 'JWT access token' })
  accessToken: string;

  @Field(() => String, { description: 'Token expiration time' })
  expiresIn: string;
}
