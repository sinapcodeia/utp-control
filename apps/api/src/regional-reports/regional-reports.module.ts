import { Module } from '@nestjs/common';
import { RegionalReportsService } from './regional-reports.service';
import { RegionalReportsController } from './regional-reports.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [RegionalReportsController],
  providers: [RegionalReportsService],
})
export class RegionalReportsModule { }
