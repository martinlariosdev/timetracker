import { InputType, Field } from '@nestjs/graphql';

/**
 * Input type for login mutation.
 * Accepts an Okta token from the mobile app for authentication.
 */
@InputType()
export class LoginInput {
  @Field(() => String, { description: 'Okta authentication token' })
  oktaToken: string;
}
