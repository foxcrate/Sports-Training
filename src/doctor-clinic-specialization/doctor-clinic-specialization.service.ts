import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorClinicSpecializationDto } from './dtos/create.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ReturnDoctorClinicSpecializationDto } from './dtos/retrun.dto';

@Injectable()
export class DoctorClinicSpecializationService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}
  async create(
    createData: CreateDoctorClinicSpecializationDto,
    userId,
  ): Promise<ReturnDoctorClinicSpecializationDto> {
    await this.findRepeated(createData.name);

    await this.prisma.$queryRaw`
      INSERT INTO DoctorClinicSpecialization
        (name)
        VALUES
      (${createData.name})`;

    let newRegion = await this.prisma.$queryRaw`
      SELECT *
      FROM DoctorClinicSpecialization
      ORDER BY createdAt DESC
      LIMIT 1`;
    return newRegion[0];
  }

  async getAll() {
    let allDoctorClinicSpecialization: ReturnDoctorClinicSpecializationDto[] = await this
      .prisma.$queryRaw`
    SELECT *
    FROM DoctorClinicSpecialization
      `;
    return allDoctorClinicSpecialization;
  }

  async findRepeated(name): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedDoctorClinicSpecialization = await this.prisma.$queryRaw`
    SELECT *
      FROM DoctorClinicSpecialization
      WHERE name = ${name}
      LIMIT 1
      `;

    if (repeatedDoctorClinicSpecialization[0]) {
      if (repeatedDoctorClinicSpecialization[0].name == name) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_DOCTOR_CLINIC_SPECIALIZATION`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }
}
