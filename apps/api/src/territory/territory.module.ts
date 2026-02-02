import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TerritoryController } from './territory.controller';
import { TerritoryService } from './territory.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TerritoryController],
  providers: [TerritoryService]
})
export class TerritoryModule { }
