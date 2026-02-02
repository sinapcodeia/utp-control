import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportType, ReportFormat, Report } from '@prisma/client';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ReportGeneratorService } from '../services/report-generator.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private reportGenerator: ReportGeneratorService
  ) { }

  async generateReport(
    userId: string,
    dto: GenerateReportDto,
  ): Promise<Report> {
    this.logger.log(`Generando informe tipo ${dto.type} para el usuario ${userId}`);

    const code = this.generateReportCode(dto);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Fetch stats for the report
    const stats = await this.fetchReportData(dto);

    // Generate real PDF buffer
    const buffer = await this.reportGenerator.generateExecutiveReport(
      stats,
      dto.type,
      { name: user?.fullName || 'Desconocido', email: user?.email || 'N/A' }
    );

    // In a real Silicon Valley stack, we would upload to S3 here.
    // For now, we simulate the URL but we could serve it via a controller.
    const url = `/api/reports/download/${code}.pdf`;

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    const report = await this.prisma.report.create({
      data: {
        code,
        type: dto.type,
        format: dto.format,
        url,
        hashSha256: hash,
        generatedById: userId,
        regionId: dto.regionId,
        municipalityId: dto.municipalityId,
        metadata: { ...dto.filters, generatedBy: user?.fullName || 'Sistema' },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'GENERATE_REPORT',
        entity: 'Report',
        entityId: report.id,
        metadata: { code, type: dto.type },
      },
    });

    return report;
  }

  async findAll(user: any, filters: any = {}) {
    this.logger.log(`Usuario ${user.id} (${user.role}) solicitando informes con filtros: ${JSON.stringify(filters)}`);

    const roleFilter = this.buildRoleFilter(user);
    this.logger.log(`Filtro de rol construido: ${JSON.stringify(roleFilter)}`);

    const whereClause: any = {
      AND: [
        roleFilter,
        filters.type ? { type: filters.type } : {},
        filters.regionId ? { regionId: filters.regionId } : {},
        filters.municipalityId ? { municipalityId: filters.municipalityId } : {},
      ].filter(clause => Object.keys(clause).length > 0)
    };

    // Date Filtering Logic
    if (filters.startDate || filters.endDate) {
      const dateFilter: any = {};
      if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
      whereClause.AND.push({ generatedAt: dateFilter });
    }

    if (filters.status) {
      whereClause.AND.push({
        OR: [
          { metadata: { path: ['status'], string_contains: filters.status } },
          filters.status === 'Aprobado' ? { createdAt: { lte: new Date() } } : {}
        ].filter(c => Object.keys(c).length > 0)
      });
    }

    this.logger.log(`Cláusula WHERE final: ${JSON.stringify(whereClause)}`);

    const reports = await this.prisma.report.findMany({
      where: whereClause,
      include: {
        generatedBy: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        },
        region: { select: { name: true } },
        municipality: { select: { name: true } }
      },
      orderBy: { generatedAt: 'desc' },
    });

    this.logger.log(`Reportes encontrados: ${reports.length}`);
    return reports;
  }

  /**
   * Construir filtro de base de datos basado en el rol del usuario
   * Implementa la matriz de visibilidad definida en la auditoría
   */
  private buildRoleFilter(user: any) {
    const role = user.role;
    const userId = user.id;
    const userRegionId = user.regionId;
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];

    switch (role) {
      case 'ADMIN':
        return {};

      case 'COORDINATOR':
        return {
          OR: [
            { regionId: userRegionId },
            { regionId: { in: assignedRegionIds } },
            { regionId: null }, // Informes nacionales
            {
              AND: [
                { type: 'AUDIT' },
                { generatedBy: { role: 'ADMIN' } }
              ]
            }
          ]
        };

      case 'GESTOR':
      case 'USER':
        return {
          OR: [
            { regionId: userRegionId }, // Informes de su zona
            { regionId: null }, // Informes nacionales
            { generatedById: userId }, // Informes que ellos mismos generaron
            { metadata: { path: ['visibility'], string_contains: 'PUBLIC' } }
          ]
        };

      case 'SUPPORT':
        return {
          type: 'AUDIT'
        };

      default:
        return {
          id: 'never-match' // Filtro que nunca coincidirá
        };
    }
  }

  /**
   * Obtener jerarquía de informes (por región y municipio)
   * Usa el mismo filtrado por rol que findAll
   */
  async getHierarchy(user: any, regionId?: string) {
    const roleFilter = this.buildRoleFilter(user);

    // Si se especifica una región, agregar filtro adicional
    const whereClause = regionId
      ? { AND: [roleFilter, { regionId }] }
      : roleFilter;

    const reports = await this.prisma.report.findMany({
      where: whereClause as any,
      include: {
        region: true,
        municipality: true,
        generatedBy: { select: { fullName: true, role: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    // Construir jerarquía: Región -> Municipio -> Informes
    const hierarchy: any = {};
    reports.forEach((report: any) => {
      const regName = report.region?.name || 'GLOBAL';
      const munName = report.municipality?.name || 'GENERAL';

      if (!hierarchy[regName]) hierarchy[regName] = {};
      if (!hierarchy[regName][munName]) hierarchy[regName][munName] = [];

      hierarchy[regName][munName].push(report);
    });

    return hierarchy;
  }

  async findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        generatedBy: { select: { fullName: true, id: true, email: true } },
        region: true,
        municipality: true,
      },
    });
  }

  async getFileBuffer(id: string): Promise<{ buffer: Buffer, filename: string }> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { generatedBy: true }
    });

    if (!report) throw new Error('Report not found');

    const stats = await this.fetchReportData({
      type: report.type,
      regionId: report.regionId,
      format: report.format
    } as any);

    const buffer = await this.reportGenerator.generateExecutiveReport(
      stats,
      report.type,
      {
        name: report.generatedBy?.fullName || 'Desconocido',
        email: report.generatedBy?.email || 'N/A'
      }
    );

    return { buffer, filename: `${report.code}.pdf` };
  }

  private generateReportCode(dto: GenerateReportDto): string {
    const typePrefix = {
      [ReportType.GENERAL]: 'INF-GEN',
      [ReportType.REGIONAL]: 'INF-REG',
      [ReportType.ALERT]: 'INF-ALR',
      [ReportType.AUDIT]: 'INF-AUD',
    }[dto.type] || 'INF';

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const uniqueSuffix = uuidv4().split('-')[0].toUpperCase();

    return `${typePrefix}_${date}_${uniqueSuffix}`;
  }

  private async fetchReportData(dto: GenerateReportDto) {
    // Real data fetching logic
    const regionFilter = dto.regionId ? { regionId: dto.regionId } : {};

    const visitsCount = await this.prisma.visit.count({ where: regionFilter });
    const completedVisits = await this.prisma.visit.count({
      where: { ...regionFilter, status: 'COMPLETED' }
    });
    const criticalAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'HIGH' }
    });
    const preventiveAlerts = await this.prisma.regionalReport.count({
      where: { ...regionFilter, priority: 'MEDIUM' }
    });

    const recentAlerts = await this.prisma.regionalReport.findMany({
      where: regionFilter,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { content: true, priority: true }
    });

    return {
      coverage: visitsCount > 0 ? `${Math.round((completedVisits / visitsCount) * 100)}%` : '0%',
      compliance: '92%', // Mocked logic or based on business rules
      criticalAlerts,
      preventiveAlerts,
      recentAlerts
    };
  }
}
