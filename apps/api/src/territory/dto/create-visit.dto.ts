
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { VisitSource, Priority } from '@prisma/client';

export class CreateVisitDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    addressText: string;

    @IsString()
    @IsOptional()
    citizenId?: string; // Cedula (requested specifically)

    @IsString()
    @IsOptional()
    phone?: string;

    @IsUUID()
    @IsNotEmpty()
    regionId: string;

    @IsUUID()
    @IsOptional()
    municipalityId?: string;

    @IsEnum(VisitSource)
    @IsOptional()
    source?: VisitSource; // Defaults to MANUAL in service if missing

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
