import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule } from '@nestjs/schedule';
import GraphQLJSON from 'graphql-type-json';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResolver } from './health.resolver';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth.module';
import { TimesheetModule } from './timesheet.module';
import { ETOModule } from './eto/eto.module';
import { SyncModule } from './sync/sync.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RemindersModule } from './reminders/reminders.module';
import { ClientsModule } from './clients/clients.module';
import { PayPeriodModule } from './pay-period/pay-period.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
      resolvers: { JSONObject: GraphQLJSON },
    }),
    PrismaModule,
    AuthModule,
    TimesheetModule,
    ETOModule,
    SyncModule,
    NotificationsModule,
    RemindersModule,
    ClientsModule,
    PayPeriodModule,
  ],
  controllers: [AppController],
  providers: [AppService, HealthResolver],
})
export class AppModule {}
