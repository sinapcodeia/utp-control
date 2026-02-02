import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Obtener todos los documentos con filtrado automático por rol
   * Implementa Zero Trust y Least Privilege
   */
  async findAll(user: any, regionId?: string) {
    console.log(`[Documents] Usuario ${user.id} (${user.role}) solicitando documentos`);

    // Construir filtro basado en rol
    const roleFilter = this.buildRoleFilter(user);

    // Combinar con filtros adicionales
    const whereClause: any = {
      AND: [
        roleFilter,
        regionId ? { regionId } : {}
      ].filter(clause => Object.keys(clause).length > 0)
    };

    const documents = await this.prisma.document.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        region: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`[Documents] Retornando ${documents.length} documentos para usuario ${user.id}`);

    return documents;
  }

  /**
   * Construir filtro de base de datos basado en el rol del usuario
   * Implementa la matriz de visibilidad definida en la auditoría
   */
  private buildRoleFilter(user: any) {
    const role = user.role;
    const userId = user.id;
    const userRegionId = user.regionId;
    const assignedRegionIds = user.assignedRegions?.map((r: any) => r.id) || [];

    switch (role) {
      case 'ADMIN':
        // ADMIN ve TODOS los documentos sin filtro
        console.log('[Documents] Filtro ADMIN: Sin restricciones');
        return {};

      case 'COORDINATOR':
        // COORDINATOR ve:
        // 1. Documentos nacionales (regionId: null)
        // 2. Documentos de su región
        // 3. Documentos de regiones asignadas
        console.log(`[Documents] Filtro COORDINATOR: Región ${userRegionId} + Nacionales`);
        return {
          OR: [
            { regionId: null }, // Nacionales
            { regionId: userRegionId }, // Su región
            { regionId: { in: assignedRegionIds } } // Regiones asignadas
          ]
        };

      case 'GESTOR':
      case 'USER':
        // GESTOR ve:
        // 1. Documentos nacionales (regionId: null)
        // 2. Documentos de su región
        // 3. Sus propios documentos
        console.log(`[Documents] Filtro GESTOR: Región ${userRegionId} + Nacionales + Propios`);
        return {
          OR: [
            { regionId: null }, // Nacionales
            { regionId: userRegionId }, // Su región
            { uploaderId: userId } // Sus propios documentos
          ]
        };

      case 'SUPPORT':
        // SUPPORT solo ve documentos nacionales (manuales, guías)
        console.log('[Documents] Filtro SUPPORT: Solo nacionales');
        return {
          regionId: null
        };

      default:
        // Por seguridad, si el rol no está definido, no retornar nada
        console.warn(`[Documents] Rol desconocido: ${role}. Bloqueando acceso.`);
        return {
          id: 'never-match' // Filtro que nunca coincidirá
        };
    }
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async create(uploaderId: string, dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        url: dto.url,
        hash: dto.hash,
        uploaderId,
        regionId: dto.regionId,
      },
    });
  }

  async addComment(documentId: string, userId: string, dto: CreateCommentDto) {
    // Verify document exists
    await this.findOne(documentId);

    return this.prisma.documentComment.create({
      data: {
        content: dto.content,
        documentId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }
}
