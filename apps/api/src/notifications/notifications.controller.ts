import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('notifications')
@UseGuards(SupabaseGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('subscribe')
    async subscribe(@Body() dto: PushSubscriptionDto, @Request() req) {
        const userId = req.user.id;
        return this.notificationsService.saveSubscription(userId, dto.subscription);
    }

    @Post('unsubscribe')
    async unsubscribe(@Request() req) {
        const userId = req.user.id;
        return this.notificationsService.removeSubscription(userId);
    }

    @Post('send-test')
    async sendTest(@Request() req) {
        const userId = req.user.id;
        return this.notificationsService.sendTestNotification(userId);
    }
}
