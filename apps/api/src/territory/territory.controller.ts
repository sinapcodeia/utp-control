import { Body, Controller, Get, Post, Patch, Query, UseGuards, Request, Param } from '@nestjs/common';
import { TerritoryService } from './territory.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { RunSimulationDto } from './dto/run-simulation.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('territory')
@UseGuards(SupabaseGuard)
export class TerritoryController {
    constructor(private readonly territoryService: TerritoryService) { }

    @Post('visits')
    async createVisit(@Body() createVisitDto: CreateVisitDto, @Request() req: any) {
        return this.territoryService.createVisit(createVisitDto, req.user.id);
    }

    @Patch('visits/:id')
    async updateVisit(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto, @Request() req: any) {
        return this.territoryService.updateVisit(id, updateVisitDto, req.user.id);
    }

    @Post('visits/:id/close')
    async closeVisit(@Param('id') id: string, @Body() data: any, @Request() req: any) {
        return this.territoryService.closeVisit(id, data, req.user.id);
    }

    @Get('visits')
    async findAllVisits(@Request() req: any, @Query('regionId') regionId?: string) {
        return this.territoryService.findAllVisits(req.user, regionId);
    }

    @Get('my-visits')
    async getMyVisits(@Request() req: any) {
        return this.territoryService.getMyVisits(req.user.id);
    }

    @Post('simulate')
    async runSimulation(@Body() simulationDto: RunSimulationDto) {
        return this.territoryService.runSimulation(simulationDto);
    }

    @Get('regions')
    async getRegions() {
        return this.territoryService.getRegions();
    }

    @Get('municipalities')
    async getMunicipalities(@Query('regionId') regionId?: string) {
        return this.territoryService.getMunicipalities(regionId);
    }

    @Get('veredas')
    async getVeredas(@Query('municipalityId') municipalityId?: string) {
        return this.territoryService.getVeredas(municipalityId);
    }
}
