import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export enum ReportFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY'
}

export class ScheduleReportDto {
    @IsEnum(ReportFrequency)
    frequency: ReportFrequency;

    @IsOptional()
    @IsString()
    regionId?: string;

    @IsOptional()
    @IsString()
    municipalityId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
