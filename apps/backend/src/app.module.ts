import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResolver } from './health.resolver';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth.module';
import { TimesheetModule } from './timesheet.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    PrismaModule,
    AuthModule,
    TimesheetModule,
  ],
  controllers: [AppController],
  providers: [AppService, HealthResolver],
})
export class AppModule {}
