import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ClientType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  code: string;

  @Field(() => Boolean, { description: 'Whether client is active' })
  active: boolean;
}
