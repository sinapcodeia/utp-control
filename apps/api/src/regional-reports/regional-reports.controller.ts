import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RegionalReportsService } from './regional-reports.service';
import { CreateRegionalReportDto } from './dto/create-regional-report.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('regional-reports')
@UseGuards(SupabaseGuard)
export class RegionalReportsController {
  constructor(
    private readonly regionalReportsService: RegionalReportsService,
  ) { }

  @Get()
  async findAll(
    @Req() req,
    @Query('regionId') regionId?: string,
    @Query('unreadBy') unreadBy?: string,
  ) {
    return this.regionalReportsService.findAll(req.user, regionId, unreadBy);
  }

  @Get('hierarchy')
  async getHierarchy(
    @Req() req,
    @Query('admin') admin?: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.regionalReportsService.getHierarchy(req.user, admin === 'true', regionId);
  }

  @Get('unread')
  async getUnread(@Req() req) {
    const userId = req.user.id;
    return this.regionalReportsService.getUnreadNationalNews(userId);
  }

  @Get('compliance-stats')
  async getCompliance() {
    return this.regionalReportsService.getComplianceStats();
  }

  @Post(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.regionalReportsService.markAsRead(userId, id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.regionalReportsService.findOne(id);
  }

  @Post()
  async create(@Req() req, @Body() createDto: CreateRegionalReportDto) {
    const userId = req.user.id;
    return this.regionalReportsService.create(userId, createDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.regionalReportsService.remove(id);
  }
}
