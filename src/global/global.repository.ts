import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GlobalRepository {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async allAgeGroups(): Promise<[]> {
    let allAgeGroups: [] = await this.prisma.$queryRaw`
        SELECT
        AgeGroup.id,
        AgeGroupTranslation.name AS name
        FROM
        AgeGroup
        LEFT JOIN AgeGroupTranslation
        ON AgeGroupTranslation.ageGroupId = AgeGroup.id
        AND AgeGroupTranslation.language = ${I18nContext.current().lang}
      `;

    return allAgeGroups;
  }

  async allRegions(): Promise<[]> {
    let allRegions: [] = await this.prisma.$queryRaw`
        SELECT
        Region.id,
        RegionTranslation.name AS name
        FROM
        Region
        LEFT JOIN RegionTranslation
        ON RegionTranslation.regionId = Region.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
      `;

    return allRegions;
  }

  async allLevels(): Promise<[]> {
    let allLevels: [] = await this.prisma.$queryRaw`
        SELECT
        Level.id,
        LevelTranslation.name AS name
        FROM
        Level
        LEFT JOIN LevelTranslation
        ON LevelTranslation.levelId = Level.id
        AND LevelTranslation.language = ${I18nContext.current().lang}
      `;

    return allLevels;
  }

  async allGenders(): Promise<[]> {
    let allGenders: [] = await this.prisma.$queryRaw`
        SELECT
        Gender.id,
        GenderTranslation.name AS name
        FROM
        Gender
        LEFT JOIN GenderTranslation
        ON GenderTranslation.genderId = Gender.id
        AND GenderTranslation.language = ${I18nContext.current().lang}
      `;

    return allGenders;
  }

  async allFeedbacks(): Promise<[]> {
    let allFeedbacks: [] = await this.prisma.$queryRaw`
        SELECT
        Feedback.id,
        FeedbackTranslation.content AS content
        FROM
        Feedback
        LEFT JOIN FeedbackTranslation ON FeedbackTranslation.feedbackId = Feedback.id
        AND FeedbackTranslation.language = ${I18nContext.current().lang}
      `;

    return allFeedbacks;
  }

  async allWeekDays(): Promise<[]> {
    let allWeekDays: [] = await this.prisma.$queryRaw`
        SELECT
        WeekDay.dayNumber AS dayNumber,
        WeekDayTranslation.dayName AS dayName
        FROM
        WeekDay
        LEFT JOIN WeekDayTranslation ON WeekDayTranslation.weekDayId = WeekDay.id
        AND WeekDayTranslation.language = ${I18nContext.current().lang}
      `;

    return allWeekDays;
  }

  async getOneAgeGroup(ageGroupId: number): Promise<any> {
    let ageGroup: any[] = await this.prisma.$queryRaw`
        SELECT
        AgeGroup.id,
        AgeGroupTranslation.name AS name
        FROM
        AgeGroup
        LEFT JOIN AgeGroupTranslation
        ON AgeGroupTranslation.ageGroupId = AgeGroup.id
        AND AgeGroupTranslation.language = ${I18nContext.current().lang}
        WHERE AgeGroup.id = ${ageGroupId}
      `;

    if (!ageGroup[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.AGE_GROUP_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return ageGroup[0];
  }

  async getIdByWeekDayNumber(weekDayNumber): Promise<any> {
    let id: any[] = await this.prisma.$queryRaw`
    SELECT
    id
    FROM
    WeekDay
    WHERE dayNumber = ${weekDayNumber}
  `;
    if (!id[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.WEEK_DAY_NOT_EXIST`, { lang: I18nContext.current().lang }),
      );
    }
    return id[0].id;
  }
}
