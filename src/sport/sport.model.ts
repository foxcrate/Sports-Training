import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ReturnSportDto } from './dtos/return.dto';
import { CreateSportDto } from './dtos/create.dto';

@Injectable()
export class SportModel {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<ReturnSportDto[]> {
    let allSports: ReturnSportDto[] = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
      `;

    return allSports;
  }

  async findByIds(sportsArray: number[]): Promise<ReturnSportDto[]> {
    let foundedSports: Array<ReturnSportDto> = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
    WHERE id IN (${Prisma.join(sportsArray)});
    `;

    return foundedSports;
  }

  async findByName(name: string): Promise<ReturnSportDto[]> {
    let repeatedSport: [] = await this.prisma.$queryRaw`
    SELECT *
      FROM Sport
      WHERE name = ${name}
      `;

    return repeatedSport;
  }

  async create(createData: CreateSportDto): Promise<ReturnSportDto[]> {
    await this.prisma.$queryRaw`
    INSERT INTO Sport
      (name)
      VALUES
    (${createData.name})`;

    let newSport: ReturnSportDto[] = await this.prisma.$queryRaw`
    SELECT
    *
    FROM Sport
    WHERE Sport.name = ${createData.name}
    `;

    return newSport;
  }
}
