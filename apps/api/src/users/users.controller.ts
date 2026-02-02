import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Post,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('users')
@UseGuards(SupabaseGuard) // Global protection for all endpoints in this controller
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  async getMe(@Req() req) {
    const user = req.user;
    if (user.sub && !user.fullName) {
      return this.usersService.sync(
        user.sub,
        user.email,
        user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario Nuevo'
      );
    }
    return user;
  }

  @Get()
  async findAll(@Req() req, @Query('region') region?: string) {
    const user = req.user;

    // COORDINATOR can only fetch users in their region
    if (user.role === 'COORDINATOR') {
      const coordinatorRegion = user.region?.name;
      return this.usersService.findAll(coordinatorRegion || region);
    }

    // ADMIN can see all
    if (user.role === 'ADMIN') {
      return this.usersService.findAll(region);
    }

    // Other roles can see users from their region for collaboration
    return this.usersService.findAll(user.region?.name);
  }

  @Get('tc-compliance')
  async getTCCompliance(@Req() req) {
    this.checkAdmin(req.user);
    return this.usersService.getTCCompliance();
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    // Only admins or the user themselves can view their profile
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Req() req, @Body() data: any) {
    this.checkAdmin(req.user);
    return this.usersService.create(data);
  }

  @Patch(':id/permissions')
  async updatePermissions(@Req() req, @Param('id') id: string, @Body() permissions: any) {
    this.checkAdmin(req.user);
    return this.usersService.updatePermissions(id, permissions);
  }

  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() data: any) {
    this.checkAdmin(req.user);
    return this.usersService.update(id, data);
  }

  private checkAdmin(user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Silicon Valley Standard: Administrative privileges required');
    }
  }
}
