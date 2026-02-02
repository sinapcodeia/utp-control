import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('test-auth')
@UseGuards(SupabaseGuard)
export class TestAuthController {
    @Get()
    async testAuth(@Req() req) {
        return {
            success: true,
            message: 'Autenticación exitosa',
            user: {
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role,
                isActive: req.user.isActive,
            }
        };
    }
}
