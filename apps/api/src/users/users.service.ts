import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface PermissionGroup {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface NewsPermissions extends PermissionGroup {
  create: boolean;
  edit_own: boolean;
  edit_all: boolean;
}

interface StaffPermissions {
  invite: boolean;
  manage_perms: boolean;
  block: boolean;
}

interface UserPermissions {
  dir: PermissionGroup;
  news: NewsPermissions;
  staff: StaffPermissions;
  territory: {
    allRegions: boolean;
    regions: string[]; // IDs de regiones asignadas
  };
}

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'COORDINATOR' | 'USER' | 'SUPPORT';
  isActive: boolean;
  permissions: UserPermissions;
  regionId?: string;
  assignedRegions?: string[];
  assignedMunicipalities?: string[];
  assignedVeredas?: string[];
}

const ROLE_DEFAULTS: Record<UserRecord['role'], UserPermissions> = {
  ADMIN: {
    dir: { view: true, edit: true, delete: true },
    news: {
      view: true,
      edit: true,
      create: true,
      edit_own: true,
      edit_all: true,
      delete: true,
    },
    staff: { invite: true, manage_perms: true, block: true },
    territory: { allRegions: true, regions: [] },
  },
  COORDINATOR: {
    dir: { view: true, edit: true, delete: false },
    news: {
      view: true,
      edit: true,
      create: true,
      edit_own: true,
      edit_all: false,
      delete: true,
    },
    staff: { invite: true, manage_perms: false, block: false },
    territory: { allRegions: false, regions: [] },
  },
  USER: {
    dir: { view: true, edit: false, delete: false },
    news: {
      view: true,
      edit: false,
      create: false,
      edit_own: false,
      edit_all: false,
      delete: false,
    },
    staff: { invite: false, manage_perms: false, block: false },
    territory: { allRegions: false, regions: [] },
  },
  SUPPORT: {
    dir: { view: true, edit: false, delete: false },
    news: {
      view: true,
      edit: false,
      create: false,
      edit_own: false,
      edit_all: false,
      delete: false,
    },
    staff: { invite: false, manage_perms: false, block: false },
    territory: { allRegions: false, regions: [] },
  },
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async sync(id: string, email: string, fullName: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) return user;

    // Create default profile for the authenticated user
    return this.prisma.user.create({
      data: {
        id,
        email,
        fullName,
        role: 'USER',
        passwordHash: 'SYNCED_EXTERNAL',
        dni: `SYNC-${id.slice(0, 8)}`,
        permissions: ROLE_DEFAULTS.USER as any,
      }
    });
  }

  async findAll(region?: string) {
    return this.prisma.user.findMany({
      where: region && region !== 'Todas' ? { region: { name: region } } : {},
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        permissions: true,
        region: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        region: true,
        municipality: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, data: Partial<Omit<UserRecord, 'id'>>) {
    const { assignedRegions, assignedMunicipalities, assignedVeredas, ...rest } = data as any;
    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        permissions: rest.permissions
          ? (rest.permissions as Prisma.InputJsonValue)
          : undefined,
        acceptedTerms: (rest as any).acceptedTerms,
        acceptedAt: (rest as any).acceptedAt,
        assignedRegions: assignedRegions
          ? {
            set: assignedRegions.map((regionId: string) => ({ id: regionId })),
          }
          : undefined,
        assignedMunicipalities: assignedMunicipalities
          ? {
            set: assignedMunicipalities.map((munId: string) => ({ id: munId })),
          }
          : undefined,
        assignedVeredas: assignedVeredas
          ? {
            set: assignedVeredas.map((verId: string) => ({ id: verId })),
          }
          : undefined,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    role: string;
    region: string;
    assignedRegions?: string[];
    assignedMunicipalities?: string[];
    assignedVeredas?: string[];
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado en el sistema');
    }

    const region = await this.prisma.region.findUnique({
      where: { name: data.region },
    });

    return this.prisma.user.create({
      data: {
        fullName: data.name,
        email: data.email,
        role: data.role as any,
        passwordHash: 'TEMPORARY_STUB',
        dni: `TEMP-${Date.now()}`,
        regionId: region?.id,
        permissions: ROLE_DEFAULTS[
          data.role as keyof typeof ROLE_DEFAULTS
        ] as any,
        assignedRegions: data.assignedRegions
          ? {
            connect: data.assignedRegions.map((id) => ({ id })),
          }
          : undefined,
        assignedMunicipalities: data.assignedMunicipalities
          ? {
            connect: data.assignedMunicipalities.map((id) => ({ id })),
          }
          : undefined,
        assignedVeredas: data.assignedVeredas
          ? {
            connect: data.assignedVeredas.map((id) => ({ id })),
          }
          : undefined,
      },
    });
  }

  async updatePermissions(id: string, permissions: UserPermissions) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id },
      data: {
        permissions: permissions as any,
      },
      select: {
        id: true,
        permissions: true,
      },
    });
  }

  async getTCCompliance() {
    try {
      console.log("DEBUG: Usando RAW QUERY para tc-compliance para evadir errores de Enum...");
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT id, full_name as "fullName", email, role, accepted_terms as "acceptedTerms", accepted_at as "acceptedAt"
        FROM users
      `) as any[];
      return result;
    } catch (e: any) {
      console.error("DEBUG ERROR EN GET-TC-COMPLIANCE (RAW):", e);
      throw e;
    }
  }
}
