import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { NewsCategory, Priority } from '@prisma/client';

export class CreateRegionalReportDto {
  @IsEnum(NewsCategory)
  @IsNotEmpty()
  category: NewsCategory;

  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;

  @IsUUID()
  @IsOptional()
  municipalityId?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsString()
  @IsOptional()
  locationManualRegion?: string;

  @IsString()
  @IsOptional()
  locationManualDepartment?: string;

  @IsString()
  @IsOptional()
  locationManualMunicipality?: string;
}
