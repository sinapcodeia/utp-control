import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.getSystemHealth();
  }

  @Get('liveness')
  liveness() {
    // Kubernetes liveness probe
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  async readiness() {
    // Kubernetes readiness probe
    const health = await this.healthService.getSystemHealth();
    if (health.status !== 'healthy') {
      throw new Error('System not ready');
    }
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
