import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {
        // Configurar VAPID keys (debes generar estas keys en producción)
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ||
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xYjEB6hvqRxYmjfIAjXbLNilO5Oy4Fj3qvnB2hhEAJmRYjqXhqE8s';
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ||
            'UUxI4O8TWsK7eoZd-5Kz7neSt3KBH7NOX8mYTc8VfiY';

        webpush.setVapidDetails(
            'mailto:admin@utpcontrol.com',
            vapidPublicKey,
            vapidPrivateKey
        );
    }

    async saveSubscription(userId: string, subscription: any) {
        // Guardar en base de datos
        await this.prisma.pushSubscription.upsert({
            where: { userId },
            update: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                expirationTime: subscription.expirationTime,
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                expirationTime: subscription.expirationTime,
            },
        });

        return { success: true, message: 'Suscripción guardada' };
    }

    async removeSubscription(userId: string) {
        await this.prisma.pushSubscription.delete({
            where: { userId },
        });

        return { success: true, message: 'Suscripción eliminada' };
    }

    async sendTestNotification(userId: string) {
        const subscription = await this.prisma.pushSubscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            throw new Error('No subscription found');
        }

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        };

        const payload = JSON.stringify({
            title: 'UTP CONTROL',
            body: 'Notificaciones activadas correctamente ✅',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
                url: '/dashboard',
            },
        });

        try {
            await webpush.sendNotification(pushSubscription, payload);
            return { success: true, message: 'Notificación enviada' };
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    async sendNotificationToUser(
        userId: string,
        title: string,
        body: string,
        url?: string
    ) {
        const subscription = await this.prisma.pushSubscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            return { success: false, message: 'No subscription found' };
        }

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        };

        const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
                url: url || '/dashboard',
            },
        });

        try {
            await webpush.sendNotification(pushSubscription, payload);
            return { success: true, message: 'Notificación enviada' };
        } catch (error) {
            console.error('Error sending notification:', error);
            return { success: false, message: error.message };
        }
    }

    async sendNotificationToRole(
        role: Role,
        title: string,
        body: string,
        url?: string
    ) {
        const users = await this.prisma.user.findMany({
            where: { role },
            include: { pushSubscription: true },
        });

        const results = await Promise.allSettled(
            users
                .filter(user => user.pushSubscription)
                .map(user => this.sendNotificationToUser(user.id, title, body, url))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return {
            success: true,
            sent: successful,
            failed,
            total: users.length,
        };
    }

    async sendNotificationToRegion(
        regionId: string,
        title: string,
        body: string,
        url?: string
    ) {
        // Encontrar coordinadores asignados a esta región
        const coordinators = await this.prisma.user.findMany({
            where: {
                role: Role.COORDINATOR,
                OR: [
                    { regionId: regionId },
                    { assignedRegions: { some: { id: regionId } } }
                ]
            },
            include: { pushSubscription: true },
        });

        const results = await Promise.allSettled(
            coordinators
                .filter(user => user.pushSubscription)
                .map(user => this.sendNotificationToUser(user.id, title, body, url))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;

        return {
            success: true,
            sent: successful,
            total: coordinators.length,
        };
    }
}
