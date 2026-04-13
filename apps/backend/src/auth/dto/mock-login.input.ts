import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

/**
 * Input for mock login (development only)
 */
@InputType()
export class MockLoginInput {
  @Field(() => String, {
    description: 'Email address of the consultant to authenticate as',
  })
  @IsEmail()
  email: string;
}
