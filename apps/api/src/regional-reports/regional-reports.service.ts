import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionalReportDto } from './dto/create-regional-report.dto';
import { Priority, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RegionalReportsService {
  private readonly logger = new Logger(RegionalReportsService.name);
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) { }

  /**
   * Obtener todas las novedades con filtrado automático por rol
   * Implementa Zero Trust y Least Privilege
   */
  async findAll(user: any, regionId?: string, unreadByUserId?: string) {
    this.logger.debug(`Fetching news for user ${user.id} [${user.role}]`);

    const roleFilter = this.buildRoleFilter(user);

    const whereClause: any = {
      AND: [
        roleFilter,
        regionId ? { regionId } : {},
        unreadByUserId ? {
          readReceipts: {
            none: { userId: unreadByUserId }
          }
        } : {}
      ].filter(clause => Object.keys(clause).length > 0)
    };

    const reports = await this.prisma.regionalReport.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        region: {
          select: { id: true, name: true, code: true }
        },
        municipality: {
          select: { id: true, name: true }
        },
        readReceipts: true,
      } as any,
      orderBy: { createdAt: 'desc' },
    });

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
        this.logger.log(`Applying COORDINATOR filter for region ${userRegionId}`);
        return {
          OR: [
            { regionId: null },
            { regionId: userRegionId },
            { regionId: { in: assignedRegionIds } }
          ]
        };

      case 'GESTOR':
      case 'USER':
        this.logger.log(`Applying GESTOR filter for region ${userRegionId}`);
        return {
          OR: [
            { regionId: null },
            {
              AND: [
                { regionId: userRegionId },
                { user: { role: 'COORDINATOR' } }
              ]
            },
            { userId: userId }
          ]
        };

      case 'SUPPORT':
        return { regionId: null };

      default:
        this.logger.error(`Unknown role blocked: ${role}`);
        return { id: 'blocked-by-security' };
    }
  }

  /**
   * Obtener jerarquía de novedades
   */
  async getHierarchy(user: any, adminView: boolean = false, regionId?: string) {
    const roleFilter = this.buildRoleFilter(user);

    const whereClause = regionId
      ? { AND: [roleFilter, { regionId }] }
      : roleFilter;

    const reports = await this.prisma.regionalReport.findMany({
      where: whereClause as any,
      include: {
        region: true,
        municipality: true,
        user: { select: { fullName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Construcción de jerarquía: Región -> Municipio -> Novedades
    const hierarchy: any = {};
    reports.forEach((report) => {
      const regName = report.region?.name || 'NACIONAL';
      const munName = report.municipality?.name || 'GENERAL';

      if (!hierarchy[regName]) hierarchy[regName] = {};
      if (!hierarchy[regName][munName]) hierarchy[regName][munName] = [];

      hierarchy[regName][munName].push(report);
    });

    console.log(`[RegionalReports] Jerarquía construida con ${Object.keys(hierarchy).length} regiones`);

    return hierarchy;
  }

  async getUnreadNationalNews(userId: string) {
    // Noticias donde regionId es nulo Y el usuario no ha firmado un acuse
    return this.prisma.regionalReport.findMany({
      where: {
        regionId: null,
        readReceipts: {
          none: { userId: userId },
        },
      } as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, reportId: string) {
    return (this.prisma as any).newsReadReceipt.upsert({
      where: {
        userId_reportId: { userId, reportId },
      },
      update: {},
      create: {
        userId,
        reportId,
      },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.regionalReport.findUnique({
      where: { id },
      include: {
        user: true,
        region: true,
        municipality: true,
        alerts: true,
      },
    });

    if (!report) throw new NotFoundException(`Informe ${id} no encontrado`);
    return report;
  }

  async create(userId: string, dto: CreateRegionalReportDto) {
    const report = await this.prisma.regionalReport.create({
      data: {
        category: dto.category,
        priority: dto.priority,
        title: dto.title,
        content: dto.content,
        attachmentUrl: dto.attachmentUrl,
        regionId: (dto.regionId ?? null) as any,
        municipalityId: dto.municipalityId ?? null,
        userId: userId,
        locationManualRegion: dto.locationManualRegion,
        locationManualDepartment: dto.locationManualDepartment,
        locationManualMunicipality: dto.locationManualMunicipality,
      },
      include: {
        user: { select: { fullName: true } },
        region: true,
      },
    });

    // Si la prioridad es Alta, disparar automáticamente una Alerta y Notificación Push
    if (report.priority === Priority.HIGH) {
      await this.prisma.alert.create({
        data: {
          reportId: report.id,
          priority: Priority.HIGH,
          status: 'NEW',
        },
      });

      // Enviar notificación a administradores y coordinadores pertinentes
      try {
        const title = `⚠️ Alerta Crítica: ${report.title}`;
        const body = report.content.substring(0, 100) + '...';
        const url = `/dashboard/reports/${report.id}`;

        const notificationTasks: Promise<any>[] = [
          this.notifications.sendNotificationToRole(Role.ADMIN, title, body, url)
        ];

        if (report.regionId) {
          // Notificar específicamente a los coordinadores de la región
          notificationTasks.push(this.notifications.sendNotificationToRegion(report.regionId, title, body, url));
        } else {
          // Si es nacional, notificar a todos los coordinadores
          notificationTasks.push(this.notifications.sendNotificationToRole(Role.COORDINATOR, title, body, url));
        }

        await Promise.all(notificationTasks);

        this.logger.log(`Notificaciones de alerta enviadas para reporte: ${report.id}`);
      } catch (error) {
        this.logger.error(`Error enviando notificaciones para reporte ${report.id}: ${error.message}`);
      }
    }

    return report;
  }

  async remove(id: string) {
    return this.prisma.regionalReport.delete({
      where: { id },
    });
  }

  async getComplianceStats() {
    const nationalReports = await this.prisma.regionalReport.findMany({
      where: { regionId: { equals: null } } as any,
      include: {
        _count: {
          select: { readReceipts: true },
        },
      } as any,
    });

    const totalUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    return nationalReports.map((report: any) => ({
      id: report.id,
      content: report.content,
      priority: report.priority,
      createdAt: report.createdAt,
      readCount: report._count.readReceipts,
      totalUsers,
      percentage:
        totalUsers > 0 ? (report._count.readReceipts / totalUsers) * 100 : 0,
    }));
  }
}
