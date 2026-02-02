import { IsNotEmpty, IsObject } from 'class-validator';

export class PushSubscriptionDto {
    @IsNotEmpty()
    @IsObject()
    subscription: {
        endpoint: string;
        expirationTime: number | null;
        keys: {
            p256dh: string;
            auth: string;
        };
    };
}
