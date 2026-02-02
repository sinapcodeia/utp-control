import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SupabaseGuard } from './auth/supabase.guard';

@Controller('stats')
export class StatsController {
  constructor(private prisma: PrismaService) { }

  @Get('dashboard')
  @UseGuards(SupabaseGuard)
  async getDashboardStats(@Req() req) {
    const user = req.user;
    const permissions = user.permissions;
    const allRegions = permissions?.territory?.allRegions || user.role === 'ADMIN';
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];

    const regionFilter = allRegions ? {} : { regionId: { in: assignedRegionIds } };

    // --- KPIs North Star Calculation ---

    // 1. Total de Visitas Programadas para Hoy
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const visitsFilter = allRegions ? {} : {
      regionId: { in: assignedRegionIds }
    };

    const scheduledToday = await this.prisma.visit.count({
      where: {
        ...visitsFilter,
        createdAt: { gte: startOfDay, lte: endOfDay } // Usar createdAt como proxy de 'date'
      }
    });

    const completedToday = await this.prisma.visit.count({
      where: {
        ...visitsFilter,
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: 'COMPLETED'
      }
    });

    // 2. Cobertura Territorial (Unidades Visitadas / Unidades Totales)
    // Conceptualmente, ICOE. Aquí simplificado como cobertura de visitas.
    const uniqueUnitsVisited = await this.prisma.visit.groupBy({
      by: ['addressText'], // Usando addressText como proxy de Unidad Productiva por ahora
      where: {
        ...visitsFilter,
        status: 'COMPLETED'
      },
      _count: true
    });
    const totalUnitsVisited = uniqueUnitsVisited.length;
    // Mock total units assigned since we don't have a structured UP table yet
    const estimatedTotalUnits = 1000;

    // 3. Alertas
    const criticalAlertsCount = await this.prisma.regionalReport.count({
      where: {
        ...regionFilter,
        priority: 'HIGH'
      }
    });

    const preventiveAlertsCount = await this.prisma.regionalReport.count({
      where: {
        ...regionFilter,
        priority: 'MEDIUM'
      }
    });

    // 4. Fuerza Operativa (Gestores que han tenido actividad hoy)
    const activeGestors = await this.prisma.user.count({
      where: {
        ...regionFilter,
        role: { in: ['GESTOR', 'ADMIN'] as any }, // Incluir ambos para KPIs operacionales
        isActive: true,
        visitLogs: {
          some: {
            timestamp: { gte: startOfDay, lte: endOfDay }
          }
        }
      }
    });

    // Total de gestores contratados/activos en sistema (para el denominador)
    const personnelTotalCount = await this.prisma.user.count({
      where: {
        ...regionFilter,
        role: 'GESTOR' as any,
        isActive: true
      }
    });

    /* Cálculos Finales */

    // % Cumplimiento Operativo (Satellite KPI)
    const complianceRate = scheduledToday > 0
      ? Math.round((completedToday / scheduledToday) * 100)
      : 0;

    // ICOE - Índice de Cobertura Operativa Efectiva (North Star)
    // Formula: (Unidades visitadas válidas × Calidad × Sin alertas críticas) / Unidades asignadas
    const validVisitsCount = await this.prisma.visit.count({
      where: {
        ...visitsFilter,
        status: 'COMPLETED',
        verifiedAt: { not: null }, // Solo visitas con evidencia
      }
    });

    // Factor de calidad: visitas con evidencia GPS / total completadas
    const visitsWithGPS = await this.prisma.visit.count({
      where: {
        ...visitsFilter,
        status: 'COMPLETED',
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    const qualityFactor = completedToday > 0 ? (visitsWithGPS / completedToday) : 0;

    // Factor de riesgo: penalización por alertas críticas
    const riskPenalty = criticalAlertsCount > 0 ? Math.max(0, 1 - (criticalAlertsCount * 0.05)) : 1;

    // ICOE Final
    const icoeScore = estimatedTotalUnits > 0
      ? Math.round(((validVisitsCount / estimatedTotalUnits) * qualityFactor * riskPenalty) * 100)
      : 0;

    // Cobertura simple (para comparación)
    const coverageRate = estimatedTotalUnits > 0
      ? Math.round((totalUnitsVisited / estimatedTotalUnits) * 100)
      : 0;

    // Índice de Riesgo Territorial
    const riskIndex = estimatedTotalUnits > 0
      ? ((criticalAlertsCount * 3) + (preventiveAlertsCount * 1)) / estimatedTotalUnits
      : 0;

    const riskLevel = riskIndex > 0.15 ? 'CRÍTICO' : riskIndex > 0.05 ? 'MEDIO' : 'BAJO';

    // Fetch legacy stats for backward compatibility
    let recentNews: any[] = [];
    try {
      recentNews = await this.prisma.regionalReport.findMany({
        where: regionFilter as any,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { region: { select: { name: true } } },
      });
    } catch (e) {
      console.error('Error fetching recent news:', e.message);
    }

    // Total documents count
    const totalDocuments = await this.prisma.document.count({ where: regionFilter });


    return {
      // North Star KPI
      icoe: `${icoeScore}%`,
      icoeRaw: icoeScore,

      // Satellite KPIs
      compliance: `${complianceRate}%`,
      complianceRaw: complianceRate,
      coverage: `${coverageRate}%`,
      coverageRaw: coverageRate,
      riskLevel,
      riskIndex: riskIndex.toFixed(3),

      // Operational Metrics
      activePersonnel: activeGestors,
      personnelTotal: personnelTotalCount,
      criticalAlerts: criticalAlertsCount,
      preventiveAlerts: preventiveAlertsCount,

      // Quality Metrics
      qualityScore: Math.round(qualityFactor * 100),
      validVisits: validVisitsCount,
      visitsWithEvidence: visitsWithGPS,

      // Legacy / Additional
      totalReports: completedToday,
      activeNews: criticalAlertsCount + preventiveAlertsCount,
      totalUsers: activeGestors,
      totalDocuments,
      recentNews,
      tcSigned: '100%',
      pendingDocs: 0,
      monthlyReports: 0,
      todayLogs: '0',
      visitCoordinates: await this.prisma.visit.findMany({
        where: { ...visitsFilter, status: 'COMPLETED', latitude: { not: null }, longitude: { not: null } },
        select: { id: true, latitude: true, longitude: true, priority: true },
        take: 100
      })
    };
  }

  @Get('team')
  @UseGuards(SupabaseGuard)
  async getTeamStats(@Req() req) {
    const user = req.user;
    const allRegions = user.role === 'ADMIN';
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];
    const regionFilter = allRegions ? {} : { regionId: { in: assignedRegionIds } };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const members = await this.prisma.user.findMany({
      where: {
        ...regionFilter,
        role: 'GESTOR' as any,
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        isActive: true,
        municipality: { select: { name: true } },
        _count: {
          select: {
            assignedVisits: {
              where: { createdAt: { gte: startOfDay, lte: endOfDay } }
            },
            visitLogs: {
              where: { timestamp: { gte: startOfDay, lte: endOfDay } }
            }
          }
        }
      }
    });

    return members.map(m => ({
      id: m.id,
      name: m.fullName,
      role: m.role,
      status: m._count.visitLogs > 0 ? 'active' : 'inactive',
      municipality: m.municipality?.name || 'Varios',
      lastActive: m._count.visitLogs > 0 ? 'En campo' : 'Sin actividad hoy',
      visitsAssigned: m._count.assignedVisits || 5, // Mock default if 0
      visitsCompleted: m._count.visitLogs // Proxy for progress
    }));
  }
}
