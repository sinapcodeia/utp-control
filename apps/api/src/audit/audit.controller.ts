import { Controller, Get, Post, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('audit')
@UseGuards(SupabaseGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async findAll(@Req() req) {
        this.checkAdmin(req.user);
        return this.auditService.findAll(req.user);
    }

    @Get('health')
    async getHealth(@Req() req) {
        // Health can be viewed by ADMIN or SUPPORT
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPPORT') {
            throw new ForbiddenException('Unauthorized for system health monitoring');
        }
        return this.auditService.getSystemHealth();
    }

    @Post('kill-processes')
    async killProcesses(@Req() req) {
        this.checkAdmin(req.user);
        return this.auditService.killProcesses();
    }

    private checkAdmin(user: any) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Critical system access restricted to administrators');
        }
    }
}
