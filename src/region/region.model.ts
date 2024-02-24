import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegionReturnDto } from './dtos/return.dto';
import { RegionCreateDto } from './dtos/create.dto';

@Injectable()
export class RegionModel {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<RegionReturnDto[]> {
    let allRegions: RegionReturnDto[] = await this.prisma.$queryRaw`
        SELECT *
        FROM Region
    `;

    return allRegions;
  }

  async findById(regionId: number): Promise<RegionReturnDto[]> {
    let foundedRegion: [] = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    WHERE id = ${regionId};
    `;

    return foundedRegion;
  }

  async findByName(name: string): Promise<RegionReturnDto[]> {
    let foundedRegion: [] = await this.prisma.$queryRaw`
    SELECT *
    FROM Region
    WHERE name = ${name}
    `;

    return foundedRegion;
  }

  async create(createData: RegionCreateDto): Promise<RegionReturnDto[]> {
    await this.prisma.$queryRaw`
    INSERT INTO Region
      (name)
      VALUES
    (${createData.name})`;

    let newRegion: RegionReturnDto[] = await this.prisma.$queryRaw`
    SELECT
    *
    FROM Region
    WHERE Region.name = ${createData.name}
    `;

    return newRegion;
  }
}
