import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportType, ReportFormat } from '@prisma/client';

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  municipalityId?: string;

  @IsOptional()
  filters?: Record<string, any>;
}
