import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async getSystemHealth() {
        const start = Date.now();
        let dbStatus = 'OFFLINE';
        let latency = 0;

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = 'ONLINE';
            latency = Date.now() - start;
        } catch (error) {
            console.error('Health Check DB Error:', error);
        }

        return {
            status: 'OPERATIONAL',
            timestamp: new Date().toISOString(),
            services: {
                api: 'ONLINE',
                database: dbStatus,
                auth: 'ONLINE',
            },
            metrics: {
                dbLatency: `${latency}ms`,
            }
        };
    }

    async killProcesses() {
        const results: string[] = [];

        try {
            // Limpiar procesos de Node y Prisma
            const { stdout: nodeOut } = await execAsync('taskkill /F /IM node.exe /T').catch(e => ({ stdout: e.message }));
            results.push(`Node Cleanup: ${nodeOut}`);

            const { stdout: prismaOut } = await execAsync('taskkill /F /IM query-engine.exe /T').catch(e => ({ stdout: e.message }));
            results.push(`Prisma Cleanup: ${prismaOut}`);

            return {
                success: true,
                message: 'Protocolo de Rescate Ejecutado',
                details: results,
                nextStep: 'El servidor se reiniciará automáticamente.'
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Fallo en Protocolo de Rescate',
                error: error.message
            };
        }
    }

    async findAll(user: any) {
        const permissions = user.permissions;
        const allRegions = permissions?.territory?.allRegions || user.role === 'ADMIN';
        const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];

        return this.prisma.auditLog.findMany({
            where: allRegions ? {} : {
                OR: [
                    { userId: user.id },
                    { user: { regionId: { in: assignedRegionIds } } }
                ]
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: 50,
        });
    }
}
