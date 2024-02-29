import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CreateDoctorClinicSpecializationDto } from './dtos/create.dto';
import { ReturnDoctorClinicSpecializationDto } from './dtos/retrun.dto';

@Injectable()
export class DoctorClinicSpecializationModel {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createData: CreateDoctorClinicSpecializationDto,
  ): Promise<ReturnDoctorClinicSpecializationDto> {
    await this.prisma.$queryRaw`
      INSERT INTO DoctorClinicSpecialization
        (name)
        VALUES
      (${createData.name_en})`;

    let newDoctorClinicSpecialization = await this.prisma.$queryRaw`
    SELECT *
    FROM DoctorClinicSpecialization
    WHERE name = ${createData.name_en}
    LIMIT 1`;

    await this.prisma.$queryRaw`
    INSERT INTO DoctorClinicSpecializationTranslation
      (name,language,doctorClinicSpecializationId)
      VALUES
    (${createData.name_en},'en',${newDoctorClinicSpecialization[0].id}),
    (${createData.name_ar},'ar',${newDoctorClinicSpecialization[0].id})
    `;

    return newDoctorClinicSpecialization[0];
  }

  async getAll() {
    let allDoctorClinicSpecialization: ReturnDoctorClinicSpecializationDto[] = await this
      .prisma.$queryRaw`
    SELECT
    DoctorClinicSpecialization.id,
    DoctorClinicSpecializationTranslation.name AS name
    FROM DoctorClinicSpecialization
    LEFT JOIN DoctorClinicSpecializationTranslation
    ON DoctorClinicSpecializationTranslation.doctorClinicSpecializationId = DoctorClinicSpecialization.id
    AND DoctorClinicSpecializationTranslation.language = ${I18nContext.current().lang}
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
