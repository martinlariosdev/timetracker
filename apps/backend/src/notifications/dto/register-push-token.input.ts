import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterPushTokenInput {
  @Field(() => String, { description: 'Expo push token for the device' })
  token: string;
}
