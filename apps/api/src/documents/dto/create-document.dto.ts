import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  hash?: string;

  @IsString()
  @IsOptional()
  regionId?: string;
}
