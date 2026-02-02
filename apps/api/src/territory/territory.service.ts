import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '@prisma/client';

@Injectable()
export class TerritoryService {
    private readonly logger = new Logger(TerritoryService.name);
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService
    ) { }

    async getRegions() {
        return this.prisma.region.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async getMunicipalities(regionId?: string) {
        return this.prisma.municipality.findMany({
            where: regionId ? { regionId } : {},
            orderBy: { name: 'asc' }
        });
    }

    async getVeredas(municipalityId?: string) {
        return this.prisma.vereda.findMany({
            where: municipalityId ? { municipalityId } : {},
            orderBy: { name: 'asc' }
        });
    }

    async createVisit(data: any, userId: string) {
        const { scheduledAt, ...rest } = data;

        // Validar que la fecha programada no sea en el pasado
        if (scheduledAt) {
            const scheduledDate = new Date(scheduledAt);
            const now = new Date();

            if (scheduledDate < now) {
                throw new BadRequestException('No se puede programar una visita en el pasado');
            }
        }

        try {
            return await this.prisma.visit.create({
                data: {
                    ...rest,
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                    assignedById: userId,
                    municipalityId: data.municipalityId || null
                }
            });
        } catch (error: any) {
            console.error("CRITICAL: Error creating visit in DB", error);
            if (error.code === 'P2022') {
                throw new BadRequestException("Sincronización de Base de Datos requerida. Faltan columnas en la tabla 'visits'. Por favor ejecuta el script master_db_sync.sql.");
            }
            if (error.code === 'P2003') {
                throw new BadRequestException("Error de integridad: El usuario asignado o la región no existen en la base de datos.");
            }
            throw new InternalServerErrorException("Error interno al crear la misión: " + error.message);
        }
    }

    async findAllVisits(user: any, regionId?: string) {
        // Lógica de visibilidad basada en roles y asignaciones
        const isAdmin = user.role === 'ADMIN';
        const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];

        const visits = await this.prisma.visit.findMany({
            where: {
                AND: [
                    regionId ? { regionId } : {},
                    !isAdmin ? {
                        OR: [
                            { regionId: { in: assignedRegionIds } },
                            { assignedToId: user.id }
                        ]
                    } : {}
                ]
            },
            include: {
                region: true,
                municipality: true,
                assignedTo: {
                    select: {
                        id: true,
                        fullName: true,
                        dni: true,
                        role: true
                    }
                },
                logs: {
                    where: { action: 'CLOSURE' },
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return visits.map(visit => {
            const closureLog = visit.logs[0];
            const metadata = closureLog?.metadata as any || {};

            return {
                ...visit,
                status: metadata.status || visit.status,
                unitStatus: metadata.unitStatus,
                compliance: metadata.compliance,
                alertType: metadata.alertType,
                alertObs: metadata.alertObs,
                evidence: metadata.evidence,
                duration: metadata.duration,
                logs: undefined
            };
        });
    }

    async getMyVisits(userId: string) {
        try {
            const results = await this.prisma.visit.findMany({
                where: { assignedToId: userId },
                include: {
                    region: true,
                    municipality: true,
                    assignedTo: {
                        select: { fullName: true }
                    },
                    logs: {
                        where: { action: 'CLOSURE' },
                        orderBy: { timestamp: 'desc' },
                        take: 1
                    }
                },
                orderBy: { scheduledAt: 'asc' }
            });

            const enrichedResults = results.map(visit => {
                const closureLog = visit.logs[0];
                const metadata = closureLog?.metadata as any || {};

                return {
                    ...visit,
                    status: metadata.status || visit.status,
                    unitStatus: metadata.unitStatus,
                    compliance: metadata.compliance,
                    alertType: metadata.alertType,
                    alertObs: metadata.alertObs,
                    evidence: metadata.evidence,
                    duration: metadata.duration,
                    logs: undefined
                };
            });

            this.logger.log(`Encontradas ${enrichedResults.length} visitas para usuario ${userId}`);
            return enrichedResults;
        } catch (error) {
            this.logger.error(`Error en getMyVisits: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updateVisit(visitId: string, data: any, userId: string) {
        // Verificar que la visita existe y el usuario tiene permiso
        const visit = await this.prisma.visit.findUnique({
            where: { id: visitId }
        });

        if (!visit) {
            throw new NotFoundException('Visita no encontrada');
        }

        // Verificar permisos: solo el asignado o un admin/coordinador puede actualizar
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { assignedRegions: true }
        });

        const canUpdate = user?.role === 'ADMIN' ||
            user?.role === 'COORDINATOR' ||
            visit.assignedToId === userId;

        if (!canUpdate) {
            throw new BadRequestException('No tienes permisos para actualizar esta visita');
        }

        const { scheduledAt, ...rest } = data;

        // Validar que la fecha programada no sea en el pasado
        if (scheduledAt) {
            const scheduledDate = new Date(scheduledAt);
            const now = new Date();

            if (scheduledDate < now) {
                throw new BadRequestException('No se puede programar una visita en el pasado');
            }
        }

        try {
            return await this.prisma.visit.update({
                where: { id: visitId },
                data: {
                    ...rest,
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                    municipalityId: data.municipalityId || undefined
                },
                include: {
                    region: true,
                    municipality: true,
                    assignedTo: {
                        select: { fullName: true }
                    }
                }
            });
        } catch (error: any) {
            console.error("Error updating visit in DB", error);
            if (error.code === 'P2003') {
                throw new BadRequestException("Error de integridad: La región o municipio especificado no existe.");
            }
            throw new InternalServerErrorException("Error interno al actualizar la visita: " + error.message);
        }
    }

    async closeVisit(visitId: string, data: any, userId: string) {
        // 1. Mapeo de estado
        let visitStatus = 'COMPLETED';
        if (data.status === 'NO_REALIZADA') visitStatus = 'CANCELLED';
        if (data.status === 'NOVEDADES') visitStatus = 'COMPLETED'; // Ojo: Novedades cuenta como realizada pero con obs

        // 2. Transacción para asegurar integridad
        return this.prisma.$transaction(async (tx) => {
            // Actualizar Visita
            const visit = await tx.visit.update({
                where: { id: visitId },
                data: {
                    status: visitStatus as any,
                    verifiedAt: new Date(),
                    // Si hay GPS mockeado en el frontend
                    latitude: data.location?.lat,
                    longitude: data.location?.lng,
                    gpsAccuracy: data.location?.accuracy || 10,
                    reliability: 'HIGH', // Asumimos alta confiabilidad al cerrar con App
                }
            });

            // Crear Log de Cierre con toda la data
            await tx.visitLog.create({
                data: {
                    visitId: visit.id,
                    userId: userId,
                    action: 'CLOSURE',
                    metadata: data
                }
            });

            // 3. Crear Alerta si aplica
            if (data.alertType && data.alertType !== 'NINGUNA' && data.alertType !== 'NO_APLICA') {
                const priority = data.alertType === 'CRITICA' ? 'HIGH' : data.alertType === 'PREVENTIVA' ? 'MEDIUM' : 'LOW';

                const report = await tx.regionalReport.create({
                    data: {
                        userId: userId,
                        regionId: visit.regionId,
                        municipalityId: visit.municipalityId,
                        category: 'OTHER',
                        priority: priority,
                        title: `Alerta en Visita ${visit.fullName}`,
                        content: data.alertObs || 'Sin observaciones detalladas',
                        alerts: {
                            create: {
                                priority: priority,
                                status: 'NEW'
                            }
                        }
                    }
                });

                // Enviar notificación Push si es crítica
                if (priority === 'HIGH') {
                    try {
                        const title = `🚨 Alerta en Territorio: ${visit.fullName}`;
                        const body = `Se ha reportado una novedad crítica durante la visita.`;
                        const url = `/dashboard/reports/${report.id}`;

                        // Notificar a administradores y coordinadores de la región
                        await Promise.all([
                            this.notifications.sendNotificationToRole(Role.ADMIN, title, body, url),
                            this.notifications.sendNotificationToRegion(visit.regionId, title, body, url)
                        ]);
                        this.logger.log(`Notificaciones de alerta enviadas para reporte de visita: ${report.id}`);
                    } catch (error: any) {
                        this.logger.error(`Error enviando notificaciones para reporte de visita ${report.id}: ${error.message}`);
                    }
                }
            }

            return visit;
        });
    }

    async runSimulation(data: any) {
        // Stub para simulación de rutas
        return {
            success: true,
            optimizedCount: 10,
            estimatedTime: '2h 30m',
            timestamp: new Date().toISOString()
        };
    }
}
