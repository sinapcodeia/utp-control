import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  async checkDatabase(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.prisma.$executeRaw`SELECT 1`;
      const latency = Date.now() - start;
      this.logger.log(`Database health check: OK (${latency}ms)`);
      return { status: 'healthy', latency };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }

  async getSystemHealth() {
    const db = await this.checkDatabase();

    return {
      status: db.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
      database: db,
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
