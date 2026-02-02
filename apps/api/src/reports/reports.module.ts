import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AdvancedReportsService } from './advanced-reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../prisma/prisma.service';

import { ReportGeneratorService } from '../services/report-generator.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, AdvancedReportsService, PrismaService, ReportGeneratorService],
})
export class ReportsModule { }
