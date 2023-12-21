import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HomeModel {
  constructor(private prisma: PrismaService) {}

  async getCoaches(filters: SearchFiltersDto) {
    let sql = `SELECT * FROM TrainerProfile AS tp JOIN User AS u ON tp.userId = u.id;`;
    const preparedQuery = Prisma.sql([sql]);
    return this.prisma.$queryRaw(preparedQuery);
  }

  async getDoctors(filters: SearchFiltersDto) {
    let sql = `SELECT * FROM TrainerProfile AS tp JOIN User AS u ON tp.userId = u.id;`;
    const preparedQuery = Prisma.sql([sql]);
    return this.prisma.$queryRaw(preparedQuery);
  }

  async getFields(filters: SearchFiltersDto) {
    let sql = `SELECT * FROM TrainerProfile AS tp JOIN User AS u ON tp.userId = u.id;`;
    const preparedQuery = Prisma.sql([sql]);
    return this.prisma.$queryRaw(preparedQuery);
  }
}
