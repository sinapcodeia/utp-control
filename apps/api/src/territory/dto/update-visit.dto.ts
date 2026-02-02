
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { VisitSource, Priority } from '@prisma/client';

export class UpdateVisitDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    addressText?: string;

    @IsString()
    @IsOptional()
    citizenId?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsUUID()
    @IsOptional()
    regionId?: string;

    @IsUUID()
    @IsOptional()
    municipalityId?: string;

    @IsEnum(VisitSource)
    @IsOptional()
    source?: VisitSource;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    scheduledAt?: string;

    @IsString()
    @IsOptional()
    assignedToId?: string;

    @IsString()
    @IsOptional()
    vereda?: string;

    @IsString()
    @IsOptional()
    area?: string;
}
