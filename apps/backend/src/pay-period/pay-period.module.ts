import { Module } from '@nestjs/common';
import { PayPeriodService } from './pay-period.service';
import { PayPeriodResolver } from './pay-period.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PayPeriodService, PayPeriodResolver],
  exports: [PayPeriodService],
})
export class PayPeriodModule {}
