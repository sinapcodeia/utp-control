import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatsController } from './stats.controller';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { RegionalReportsModule } from './regional-reports/regional-reports.module';
import { HealthModule } from './health/health.module';
import { TerritoryModule } from './territory/territory.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TestAuthController } from './test-auth/test-auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ReportsModule,
    UsersModule,
    DocumentsModule,
    RegionalReportsModule,
    HealthModule,
    TerritoryModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [AppController, StatsController, TestAuthController],
  providers: [AppService],
})
export class AppModule { }
