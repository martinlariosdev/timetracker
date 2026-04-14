import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class TestNotificationInput {
  @Field(() => String, { description: 'Notification title' })
  title: string;

  @Field(() => String, { description: 'Notification body' })
  body: string;
}
