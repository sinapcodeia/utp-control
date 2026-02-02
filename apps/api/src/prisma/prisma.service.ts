import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('--- DB CONECTADA EXITOSAMENTE ---');
    } catch (error) {
      console.error('--- FALLO DE CONEXIÓN DB (RESILIENTE) ---');
      console.error(error);
    }
  }
}
