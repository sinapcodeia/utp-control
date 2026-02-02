import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VisitsComplianceReport {
    period: {
        start: Date;
        end: Date;
    };
    national: {
        totalVisits: number;
        completedVisits: number;
        pendingVisits: number;
        cancelledVisits: number;
        completionRate: number;
        trend: 'up' | 'down' | 'stable';
    };
    byRegion: Array<{
        region: string;
        regionId: string;
        coordinator: string | null;
        totalVisits: number;
        completedVisits: number;
        pendingVisits: number;
        completionRate: number;
        rank: number;
    }>;
    byCoordinator: Array<{
        coordinator: string;
        coordinatorId: string;
        region: string;
        totalVisits: number;
        completedVisits: number;
        avgVisitsPerDay: number;
        efficiency: number;
    }>;
    byGestor: Array<{
        gestor: string;
        gestorId: string;
        coordinator: string | null;
        region: string;
        totalVisits: number;
        completedVisits: number;
        avgVisitsPerDay: number;
        quality: number;
    }>;
    insights: {
        topPerformers: string[];
        needsAttention: string[];
        projectedCompletion: Date | null;
        recommendations: string[];
    };
}

@Injectable()
export class AdvancedReportsService {
    private readonly logger = new Logger(AdvancedReportsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Genera informe completo de cumplimiento de visitas
     * Estilo Silicon Valley: Métricas accionables con insights
     */
    async generateVisitsComplianceReport(
        startDate?: Date,
        endDate?: Date
    ): Promise<VisitsComplianceReport> {
        const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate || new Date();

        this.logger.log(`Generating compliance report for ${start.toISOString()} to ${end.toISOString()}`);

        // Fetch all visits in period
        const visits = await this.prisma.visit.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                region: true,
                assignedTo: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                },
                assignedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        });

        // National metrics
        const totalVisits = visits.length;
        const completedVisits = visits.filter(v =>
            v.status === 'COMPLETED' || v.status === 'VERIFIED'
        ).length;
        const pendingVisits = visits.filter(v =>
            v.status === 'PENDING' || v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS'
        ).length;
        const cancelledVisits = visits.filter(v => v.status === 'CANCELLED').length;
        const completionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

        // Calculate trend (compare with previous period)
        const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const previousStart = new Date(start);
        previousStart.setDate(previousStart.getDate() - periodDays);

        const previousVisits = await this.prisma.visit.count({
            where: {
                createdAt: {
                    gte: previousStart,
                    lt: start
                },
                status: { in: ['COMPLETED', 'VERIFIED'] }
            }
        });

        const trend: 'up' | 'down' | 'stable' =
            completedVisits > previousVisits ? 'up' :
                completedVisits < previousVisits ? 'down' : 'stable';

        // Group by region
        const regionMap = new Map<string, any>();
        visits.forEach(visit => {
            const regionName = visit.region?.name || 'Sin Región';
            const regionId = visit.regionId || 'unknown';

            if (!regionMap.has(regionId)) {
                regionMap.set(regionId, {
                    region: regionName,
                    regionId,
                    coordinator: null,
                    totalVisits: 0,
                    completedVisits: 0,
                    pendingVisits: 0,
                    completionRate: 0
                });
            }

            const regionStats = regionMap.get(regionId)!;
            regionStats.totalVisits++;

            if (visit.status === 'COMPLETED' || visit.status === 'VERIFIED') {
                regionStats.completedVisits++;
            } else if (visit.status !== 'CANCELLED') {
                regionStats.pendingVisits++;
            }

            // Try to identify coordinator
            if (visit.assignedBy?.role === 'COORDINATOR') {
                regionStats.coordinator = visit.assignedBy.fullName;
            }
        });

        // Calculate completion rates and rank
        const byRegion = Array.from(regionMap.values())
            .map(r => ({
                ...r,
                completionRate: r.totalVisits > 0 ? (r.completedVisits / r.totalVisits) * 100 : 0
            }))
            .sort((a, b) => b.completionRate - a.completionRate)
            .map((r, index) => ({ ...r, rank: index + 1 }));

        // Group by coordinator
        const coordinatorMap = new Map<string, any>();
        visits.forEach(visit => {
            if (!visit.assignedBy || visit.assignedBy.role !== 'COORDINATOR') return;

            const coordId = visit.assignedBy.id;
            const coordName = visit.assignedBy.fullName || 'Desconocido';

            if (!coordinatorMap.has(coordId)) {
                coordinatorMap.set(coordId, {
                    coordinator: coordName,
                    coordinatorId: coordId,
                    region: visit.region?.name || 'Sin Región',
                    totalVisits: 0,
                    completedVisits: 0,
                    dates: []
                });
            }

            const coordStats = coordinatorMap.get(coordId)!;
            coordStats.totalVisits++;
            coordStats.dates.push(visit.createdAt);

            if (visit.status === 'COMPLETED' || visit.status === 'VERIFIED') {
                coordStats.completedVisits++;
            }
        });

        const byCoordinator = Array.from(coordinatorMap.values()).map(c => {
            const avgVisitsPerDay = c.dates.length > 0
                ? c.totalVisits / periodDays
                : 0;
            const efficiency = c.totalVisits > 0
                ? (c.completedVisits / c.totalVisits) * 100
                : 0;

            return {
                coordinator: c.coordinator,
                coordinatorId: c.coordinatorId,
                region: c.region,
                totalVisits: c.totalVisits,
                completedVisits: c.completedVisits,
                avgVisitsPerDay: Number(avgVisitsPerDay.toFixed(2)),
                efficiency: Number(efficiency.toFixed(2))
            };
        }).sort((a, b) => b.efficiency - a.efficiency);

        // Group by gestor
        const gestorMap = new Map<string, any>();
        visits.forEach(visit => {
            if (!visit.assignedTo) return;

            const gestorId = visit.assignedTo.id;
            const gestorName = visit.assignedTo.fullName || 'Desconocido';

            if (!gestorMap.has(gestorId)) {
                gestorMap.set(gestorId, {
                    gestor: gestorName,
                    gestorId,
                    coordinator: visit.assignedBy?.fullName || null,
                    region: visit.region?.name || 'Sin Región',
                    totalVisits: 0,
                    completedVisits: 0,
                    withGPS: 0,
                    dates: []
                });
            }

            const gestorStats = gestorMap.get(gestorId)!;
            gestorStats.totalVisits++;
            gestorStats.dates.push(visit.createdAt);

            if (visit.status === 'COMPLETED' || visit.status === 'VERIFIED') {
                gestorStats.completedVisits++;
            }

            if (visit.latitude && visit.longitude) {
                gestorStats.withGPS++;
            }
        });

        const byGestor = Array.from(gestorMap.values()).map(g => {
            const avgVisitsPerDay = g.dates.length > 0
                ? g.totalVisits / periodDays
                : 0;
            const quality = g.totalVisits > 0
                ? (g.withGPS / g.totalVisits) * 100
                : 0;

            return {
                gestor: g.gestor,
                gestorId: g.gestorId,
                coordinator: g.coordinator,
                region: g.region,
                totalVisits: g.totalVisits,
                completedVisits: g.completedVisits,
                avgVisitsPerDay: Number(avgVisitsPerDay.toFixed(2)),
                quality: Number(quality.toFixed(2))
            };
        }).sort((a, b) => b.completedVisits - a.completedVisits);

        // Generate insights
        const topPerformers = byCoordinator
            .slice(0, 3)
            .map(c => c.coordinator);

        const needsAttention = byRegion
            .filter(r => r.completionRate < 50)
            .slice(0, 3)
            .map(r => r.region);

        // Project completion date
        const avgVisitsPerDay = completedVisits / periodDays;
        const remainingVisits = pendingVisits;
        const daysToComplete = avgVisitsPerDay > 0
            ? Math.ceil(remainingVisits / avgVisitsPerDay)
            : null;
        const projectedCompletion = daysToComplete
            ? new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000)
            : null;

        // Recommendations
        const recommendations: string[] = [];
        if (completionRate < 70) {
            recommendations.push('Incrementar recursos en regiones de bajo rendimiento');
        }
        if (needsAttention.length > 0) {
            recommendations.push(`Priorizar atención en: ${needsAttention.join(', ')}`);
        }
        if (avgVisitsPerDay < 10) {
            recommendations.push('Optimizar asignación de visitas para aumentar velocidad');
        }
        if (byGestor.some(g => g.quality < 50)) {
            recommendations.push('Capacitar gestores en captura de evidencia GPS');
        }

        return {
            period: { start, end },
            national: {
                totalVisits,
                completedVisits,
                pendingVisits,
                cancelledVisits,
                completionRate: Number(completionRate.toFixed(2)),
                trend
            },
            byRegion,
            byCoordinator,
            byGestor,
            insights: {
                topPerformers,
                needsAttention,
                projectedCompletion,
                recommendations
            }
        };
    }

    /**
     * Genera informe de cobertura territorial
     */
    async generateTerritorialCoverageReport() {
        // TODO: Implementar cuando tengamos datos de UPs totales
        return {
            message: 'Territorial coverage report - Coming soon'
        };
    }

    /**
     * Genera proyección de alcance
     */
    async generateReachProjectionReport() {
        // TODO: Implementar con ML/estadísticas avanzadas
        return {
            message: 'Reach projection report - Coming soon'
        };
    }
}
