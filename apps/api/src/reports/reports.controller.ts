import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { ReportGeneratorService } from '../services/report-generator.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AdvancedReportsService } from './advanced-reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('reports')
@UseGuards(SupabaseGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly advancedReportsService: AdvancedReportsService,
    private readonly reportGenerator: ReportGeneratorService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('generate')
  async generate(@Req() req, @Body() dto: GenerateReportDto) {
    // User is attached to req.user by the Guard (Mocked payload or decoded JWT)
    const userId = req.user?.sub || req.user?.id;
    return this.reportsService.generateReport(userId, dto);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('type') type?: string,
    @Query('regionId') regionId?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.findAll(req.user, { type, regionId, status });
  }

  @Get('hierarchy')
  async getHierarchy(@Req() req, @Query('regionId') regionId?: string) {
    return this.reportsService.getHierarchy(req.user, regionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get('visit/:id/pdf')
  async generateVisitPdf(@Param('id') visitId: string, @Res() res: Response) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        assignedTo: true,
        region: true,
        municipality: true,
        logs: true
      }
    });

    if (!visit) {
      return res.status(404).send('Visita no encontrada');
    }

    const buffer = await this.reportGenerator.generateVisitReport(visit);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Visita_${visit.id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
  @Get('executive/pdf')
  async generateExecutivePdf(@Req() req, @Res() res: Response) {
    const user = req.user;

    // 1. Replicate quick stats logic (North Star Lite)
    // This duplicates logic from StatsController but ensures independence for PDF generation
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];
    const allRegions = user.permissions?.territory?.allRegions || user.role === 'ADMIN';
    const regionFilter = allRegions ? {} : { regionId: { in: assignedRegionIds } };

    const visitsCount = await this.prisma.visit.count({ where: regionFilter as any });
    const activeAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'HIGH' } as any
    });
    const riskAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'MEDIUM' } as any
    });

    // Mocked calculation for PDF demo
    // 2. Fetch real alert details for "Novedades"
    const recentAlerts = await this.prisma.regionalReport.findMany({
      where: regionFilter as any,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { region: true }
    });

    const stats = {
      coverage: '82%',
      compliance: '94%',
      criticalAlerts: activeAlerts,
      preventiveAlerts: riskAlerts,
      recentAlerts: recentAlerts.map(a => ({
        content: a.content,
        priority: a.priority,
        region: a.region?.name || 'Nacional'
      }))
    };

    const buffer = await this.reportGenerator.generateExecutiveReport(
      stats,
      'ENERO 2026',
      {
        name: user.fullName || user.full_name || 'Gestor UTP',
        email: user.email || 'N/A'
      }
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Informe_Ejecutivo_2026.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // Rutas para informes consolidados por periodo
  @Get('diario/pdf')
  async generateDailyPdf(@Req() req, @Res() res: Response) {
    return this.generateConsolidatedPdf(req, res, 'DIARIO', 'Resumen de actividad de hoy');
  }

  @Get('semanal/pdf')
  async generateWeeklyPdf(@Req() req, @Res() res: Response) {
    return this.generateConsolidatedPdf(req, res, 'SEMANAL', 'Consolidado de la semana actual');
  }

  @Get('mensual/pdf')
  async generateMonthlyPdf(@Req() req, @Res() res: Response) {
    return this.generateConsolidatedPdf(req, res, 'MENSUAL', 'Reporte ejecutivo del mes');
  }

  @Get(':id/download')
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    try {
      const { buffer, filename } = await this.reportsService.getFileBuffer(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${filename}`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (e) {
      res.status(404).send('No se pudo encontrar el archivo del informe');
    }
  }

  @Get('automated/monthly')
  async generateAutomatedMonthly(@Req() req, @Res() res: Response, @Query('month') month?: string, @Query('year') year?: string) {
    const user = req.user;
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];
    const allRegions = user.permissions?.territory?.allRegions || user.role === 'ADMIN';
    const regionFilter = allRegions ? {} : { regionId: { in: assignedRegionIds } };

    // Date range calculation
    const targetMonth = month ? parseInt(month) : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // Fetch monthly aggregated data
    const visitsInPeriod = await this.prisma.visit.count({
      where: { ...regionFilter, createdAt: { gte: startDate, lte: endDate } } as any
    });

    const completedVisits = await this.prisma.visit.count({
      where: { ...regionFilter, status: 'COMPLETED', verifiedAt: { gte: startDate, lte: endDate } } as any
    });

    const criticalAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'HIGH', createdAt: { gte: startDate, lte: endDate } } as any
    });

    const preventiveAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'MEDIUM', createdAt: { gte: startDate, lte: endDate } } as any
    });

    const recentAlerts = await this.prisma.regionalReport.findMany({
      where: { ...regionFilter, createdAt: { gte: startDate, lte: endDate } } as any,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { region: true }
    });

    const stats = {
      coverage: visitsInPeriod > 0 ? `${Math.round((completedVisits / visitsInPeriod) * 100)}%` : '0%',
      compliance: completedVisits > 0 ? `${Math.min(100, Math.round((completedVisits / (visitsInPeriod || 1)) * 100))}%` : '0%',
      criticalAlerts,
      preventiveAlerts,
      recentAlerts: recentAlerts.map(a => ({
        content: a.content,
        priority: a.priority,
        region: a.region?.name || 'Nacional'
      }))
    };

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const periodLabel = `${monthNames[targetMonth]} ${targetYear}`;

    const buffer = await this.reportGenerator.generateExecutiveReport(
      stats,
      `INFORME MENSUAL - ${periodLabel}`,
      {
        name: user.fullName || user.full_name || 'Coordinador UTP',
        email: user.email || 'N/A'
      }
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Informe_Mensual_${periodLabel.replace(' ', '_')}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  private async generateConsolidatedPdf(req: any, res: Response, periodLabel: string, desc: string) {
    const user = req.user;
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];
    const allRegions = user.permissions?.territory?.allRegions || user.role === 'ADMIN';
    const regionFilter = allRegions ? {} : { regionId: { in: assignedRegionIds } };

    const visitsCount = await this.prisma.visit.count({ where: regionFilter as any });
    const activeAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'HIGH' } as any
    });
    const riskAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'MEDIUM' } as any
    });

    const recentAlerts = await this.prisma.regionalReport.findMany({
      where: regionFilter as any,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { region: true }
    });

    const stats = {
      coverage: '82%',
      compliance: '94%',
      criticalAlerts: activeAlerts,
      preventiveAlerts: riskAlerts,
      recentAlerts: recentAlerts.map(a => ({
        content: a.content,
        priority: a.priority,
        region: a.region?.name || 'Nacional'
      }))
    };

    const buffer = await this.reportGenerator.generateExecutiveReport(
      stats,
      `${periodLabel} - ${new Date().toLocaleDateString()}`,
      {
        name: user.fullName || user.full_name || 'Gestor UTP',
        email: user.email || 'N/A'
      }
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Informe_${periodLabel}_${new Date().toISOString().slice(0, 10)}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  /**
   * SILICON VALLEY STYLE: Advanced Management Reports
   */

  @Get('advanced/visits-compliance')
  async getVisitsComplianceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.advancedReportsService.generateVisitsComplianceReport(start, end);
  }

  @Get('advanced/territorial-coverage')
  async getTerritorialCoverageReport() {
    return this.advancedReportsService.generateTerritorialCoverageReport();
  }

  @Get('advanced/reach-projection')
  async getReachProjectionReport() {
    return this.advancedReportsService.generateReachProjectionReport();
  }

  @Get('advanced/executive-dashboard')
  async getExecutiveDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Consolidado de todos los informes para el dashboard CEO
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const compliance = await this.advancedReportsService.generateVisitsComplianceReport(start, end);
    const coverage = await this.advancedReportsService.generateTerritorialCoverageReport();
    const projection = await this.advancedReportsService.generateReachProjectionReport();

    return {
      compliance,
      coverage,
      projection,
      generatedAt: new Date().toISOString()
    };
  }
}
