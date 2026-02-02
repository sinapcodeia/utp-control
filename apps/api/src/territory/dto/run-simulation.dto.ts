
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class RunSimulationDto {
    @IsNumber()
    @IsOptional()
    @Min(-50)
    @Max(50)
    capacityAdjustment?: number; // % change in capacity (e.g., -10 for 10% less staff)

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    demandIncrease?: number; // % increase in visits

    @IsNumber()
    @IsOptional()
    riskFactor?: number; // 0 to 1 multiplier for risk events
}
