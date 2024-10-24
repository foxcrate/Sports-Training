import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { ReturnTrainerProfileDetailsDto } from './dtos/details-return.dto';
import { TrainerProfileCreateDto } from './dtos/create.dto';
import { Prisma } from '@prisma/client';
import { FieldReturnDto } from 'src/field/dtos/return.dto';
import { SportService } from 'src/sport/sport.service';
import { GlobalRepository } from 'src/global/global.repository';
import { SimplifiedFieldReturn } from 'src/field/dtos/field-simplified-return.dto';
import { PACKAGE_STATUS } from 'src/global/enums';
import { TrainerProfileDetailedOptions } from './dtos/trainer-profile-detailed-options.dto';
import { FIND_BY } from './trainer-profile-enums';

@Injectable()
export class TrainerProfileRepository {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private sportService: SportService,
    private globalService: GlobalService,
    private globalRepository: GlobalRepository,
  ) {}

  async findBy(column: FIND_BY, value: any): Promise<ReturnTrainerProfileDto> {
    let query = `
      SELECT
        id,
        levelId,
        ageGroupId,
        cost,
        sessionDescription,
        hoursPriorToBooking,
        userId,
        createdAt
      FROM TrainerProfile AS tp
      WHERE ${column} = ?
      LIMIT 1
    `;

    let trainerProfile = await this.prisma.$queryRawUnsafe(query, value);

    if (!trainerProfile[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.TRAINER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return trainerProfile[0];
  }

  async getOneDetailed(
    userId: number,
    options?: TrainerProfileDetailedOptions,
  ): Promise<ReturnTrainerProfileDetailsDto> {
    if (!options) {
      options = {
        includeLevel: true,
        includeUser: true,
        includeAgeGroup: true,
        includeRegion: true,
        includeGallery: true,
        includeCertificates: true,
        includePackages: true,
        includeFields: true,
        includeSports: true,
        includeFeedbacks: true,
        includeRatingNumber: true,
      };
    }

    const joins = this.buildJoins(options);

    const query = `
      SELECT 
        TrainerProfile.id, 
        TrainerProfile.cost,
        ${options.includeLevel ? this.buildLevelJson() : 'NULL AS level'},
        TrainerProfile.hoursPriorToBooking,
        TrainerProfile.sessionDescription,
        ${options.includeUser ? this.buildUserJson() : 'NULL AS user'},
        ${options.includeAgeGroup ? this.buildAgeGroupJson() : 'NULL AS ageGroup'},
        ${options.includeRegion ? this.buildRegionJson() : 'NULL AS region'},
        ${options.includeGallery ? this.buildGalleryJson() : 'NULL AS gallery'},
        ${
          options.includeCertificates
            ? this.buildCertificatesJson()
            : 'NULL AS certificates'
        },
        ${options.includePackages ? this.buildPackagesJson() : 'NULL AS packages'},
        ${options.includeFields ? this.buildFieldsJson() : 'NULL AS fields'},
        ${options.includeSports ? this.buildSportsJson() : 'NULL AS sports'},
        ${
          options.includeFeedbacks
            ? this.buildFeedbacksArray(userId)
            : 'NULL AS feedbacks'
        },
         ${
           options.includeRatingNumber
             ? this.buildRatingNumber(userId)
             : 'NULL AS ratingNumber'
         }
      FROM TrainerProfile
      ${joins}
      WHERE TrainerProfile.userId = ${userId}
      GROUP BY TrainerProfile.id;
    `;

    let trainerProfileDetails = await this.prisma.$queryRawUnsafe(query);
    if (!trainerProfileDetails[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.TRAINER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return trainerProfileDetails[0];
  }

  async getSchedulesIds(userId: number): Promise<number[]> {
    let trainerProfile = await this.findBy(FIND_BY.USER_ID, userId);

    let schedulesIds = await this.prisma.$queryRaw`
    SELECT
    JSON_ARRAYAGG(id) as ids
    FROM Schedule AS s
    WHERE s.trainerProfileId = ${trainerProfile.id}
    ;`;

    let schedulesIdsArray = schedulesIds[0].ids;

    return schedulesIdsArray;
  }

  async getTrainerFields(trainerProfileId: number): Promise<SimplifiedFieldReturn[]> {
    await this.findBy(FIND_BY.ID, trainerProfileId);
    let trainerProfileFields = await this.prisma.$queryRaw`
      SELECT 
      CASE 
      WHEN count(Field.id) = 0 THEN null
      ELSE 
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',Field.id,
        'name',Field.name
      ))
      END AS fields
      FROM TrainerProfileFields
      LEFT JOIN Field ON Field.id = TrainerProfileFields.fieldId
      WHERE trainerProfileId = ${trainerProfileId}
    `;
    return trainerProfileFields[0];
  }

  async create(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDetailsDto> {
    // validate age group existance
    if (createData.ageGroupId) {
      await this.globalRepository.getOneAgeGroup(createData.ageGroupId);
    }

    await this.prisma.$queryRaw`
    INSERT INTO TrainerProfile
    (
      levelId,
      ageGroupId,
      sessionDescription,
      cost,
      hoursPriorToBooking,
      regionId,
      userId
    )
      VALUES
    (
      ${createData.levelId},
      ${createData.ageGroupId},
      ${createData.sessionDescription},
      ${createData.cost},
      ${createData.hoursPriorToBooking},
      ${createData.regionId},
      ${userId}
    )
    `;

    let newTrainerProfile = await this.findBy(FIND_BY.USER_ID, userId);

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newTrainerProfile.id);
    }

    if (createData.fields && createData.fields.length > 0) {
      await this.createProfileFields(createData.fields, newTrainerProfile.id);
    }

    if (createData.images && createData.images.length > 0) {
      await this.createProfileImages(createData.images, newTrainerProfile.id);
    }

    if (createData.certificates && createData.certificates.length > 0) {
      await this.createProfileCertificates(createData.certificates, newTrainerProfile.id);
    }

    let newTrainerProfileDetailed = await this.getOneDetailed(userId);

    return newTrainerProfileDetailed;
  }

  async update(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDetailsDto> {
    let theTrainerProfile = await this.findBy(FIND_BY.USER_ID, userId);
    // validate age group existance
    if (createData.ageGroupId) {
      await this.globalRepository.getOneAgeGroup(createData.ageGroupId);
    }

    //update
    await this.prisma.$queryRaw`
      UPDATE TrainerProfile
      SET
      levelId = IFNULL(${createData.levelId},levelId),
      ageGroupId = IFNULL(${createData.ageGroupId},ageGroupId),
      sessionDescription = IFNULL(${createData.sessionDescription},sessionDescription),
      cost = IFNULL(${createData.cost},cost),
      hoursPriorToBooking = IFNULL(${createData.hoursPriorToBooking},hoursPriorToBooking),
      regionId = IFNULL(${createData.regionId},regionId)
      WHERE
      userId = ${userId};
    `;

    //if sportsIds array is provided, insert them in TrainerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, theTrainerProfile.id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePastTrainerSports(theTrainerProfile.id);
    }

    if (createData.fields && createData.fields.length > 0) {
      await this.createProfileFields(createData.fields, theTrainerProfile.id);
    } else if (createData.fields && createData.fields.length == 0) {
      await this.deletePastTrainerFields(theTrainerProfile.id);
    }

    if (createData.images && createData.images.length > 0) {
      await this.createProfileImages(createData.images, theTrainerProfile.id);
    } else if (createData.images && createData.images.length == 0) {
      await this.deletePastTrainerImages(theTrainerProfile.id);
    }

    if (createData.certificates && createData.certificates.length > 0) {
      await this.createProfileCertificates(createData.certificates, theTrainerProfile.id);
    } else if (createData.certificates && createData.certificates.length == 0) {
      await this.deletePastTrainerCertificates(theTrainerProfile.id);
    }

    let updatedTrainerProfile = await this.getOneDetailed(userId);

    return updatedTrainerProfile;
  }

  async insertNotAvailableDays(
    trainerProfileId: number,
    datesArray: string[],
  ): Promise<ReturnTrainerProfileDto> {
    if (this.globalService.checkRepeatedDates(datesArray)) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_DATES`, { lang: I18nContext.current().lang }),
      );
    }

    await this.deleteNotAvailableDays(trainerProfileId);
    if (datesArray.length == 0) {
      return await this.findBy(FIND_BY.ID, trainerProfileId);
    }
    let newDatesArray = [];
    for (let i = 0; i < datesArray.length; i++) {
      newDatesArray.push([new Date(datesArray[i]), trainerProfileId]);
    }
    await this.prisma.$executeRaw`
    INSERT INTO
    TrainerProfileNotAvailableDays
    (dayDate, trainerProfileId)
    VALUES
    ${Prisma.join(newDatesArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;

    return await this.findBy(FIND_BY.ID, trainerProfileId);
  }

  async deleteNotAvailableDays(trainerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM TrainerProfileNotAvailableDays
      WHERE trainerProfileId = ${trainerProfileId}
    `;
  }

  async findRepeated(userId): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedTrainerProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM TrainerProfile
    WHERE userId = ${userId}
    LIMIT 1
    `;

    if (repeatedTrainerProfile[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  async deletePastTrainerFields(trainerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM TrainerProfileFields
      WHERE trainerProfileId = ${trainerProfileId}
    `;
  }

  async deletePastTrainerSports(trainerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM TrainerProfileSports
      WHERE trainerProfileId = ${trainerProfileId}
    `;
  }

  async deletePastTrainerImages(trainerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM Picture
      WHERE trainerProfileId = ${trainerProfileId}
    `;
  }

  async deletePastTrainerCertificates(trainerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM Certificate
      WHERE trainerProfileId = ${trainerProfileId}
    `;
  }

  async deletePastNotAvailableDays(trainerProfileId: number) {
    await this.prisma.$queryRaw`
    DELETE
    FROM TrainerProfileNotAvailableDays
    WHERE trainerProfileId = ${trainerProfileId}
  `;
  }

  async deletePastBookedSessions(trainerProfileId: number) {
    // delete booked sessions requests
    await this.prisma.$queryRaw`
    DELETE
    FROM SessionRequest
    WHERE trainerBookedSessionId IN (
      SELECT
      id
      FROM
      TrainerBookedSession
      WHERE id = ${trainerProfileId}
    )
  `;

    // delete booked sessions
    await this.prisma.$queryRaw`
    DELETE
    FROM TrainerBookedSession
    WHERE trainerProfileId = ${trainerProfileId}
`;
  }

  async deleteByUserId(userId) {
    await this.prisma.$queryRaw`
    DELETE FROM
    TrainerProfile
    WHERE
    userId = ${userId};
  `;
  }

  private async createProfileImages(imagesArray, newTrainerProfileId) {
    //array of objects to insert to db
    const profilesAndImages = [];
    for (let i = 0; i < imagesArray.length; i++) {
      profilesAndImages.push({
        trainerProfileId: newTrainerProfileId,
        imageLink: imagesArray[i],
      });
    }

    //delete past PlayerProfileImages
    await this.deletePastTrainerImages(newTrainerProfileId);

    await this.prisma.picture.createMany({ data: profilesAndImages });
  }

  private async createProfileCertificates(certificatesArray, newTrainerProfileId) {
    //array of objects to insert to db
    const profilesAndCertificates = [];
    for (let i = 0; i < certificatesArray.length; i++) {
      profilesAndCertificates.push({
        trainerProfileId: newTrainerProfileId,
        name: certificatesArray[i].name,
        imageLink: certificatesArray[i].imageLink,
      });
    }

    //delete past PlayerProfileImages
    await this.deletePastTrainerCertificates(newTrainerProfileId);

    await this.prisma.certificate.createMany({ data: profilesAndCertificates });
  }

  private async createProfileSports(sportsIds, newTrainerProfileId) {
    //throw an error if a sport id is not exist
    await this.sportService.checkExistance(sportsIds);

    //array of objects to insert to db
    const profilesAndSports = [];
    for (let i = 0; i < sportsIds.length; i++) {
      profilesAndSports.push({
        trainerProfileId: newTrainerProfileId,
        sportId: sportsIds[i],
      });
    }

    //delete past PlayerProfileSports
    await this.deletePastTrainerSports(newTrainerProfileId);

    await this.prisma.trainerProfileSports.createMany({ data: profilesAndSports });
  }

  private async createProfileFields(fieldsIds, newTrainerProfileId) {
    //throw an error if a sport id is not exist
    await this.checkFieldsExistance(fieldsIds);

    //array of objects to insert to db
    const profilesAndFields = [];
    for (let i = 0; i < fieldsIds.length; i++) {
      profilesAndFields.push({
        trainerProfileId: newTrainerProfileId,
        fieldId: fieldsIds[i],
      });
    }

    //delete past PlayerProfileSports
    await this.deletePastTrainerFields(newTrainerProfileId);

    await this.prisma.trainerProfileFields.createMany({ data: profilesAndFields });
  }

  private async checkFieldsExistance(fieldsArray): Promise<boolean> {
    let foundedFields: Array<FieldReturnDto> = await this.prisma.$queryRaw`
    SELECT *
    FROM Field
    WHERE id IN (${Prisma.join(fieldsArray)});
    `;

    if (foundedFields.length < fieldsArray.length) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  ////////////////////////////////////

  private buildLevelJson() {
    return `
      MAX(LevelTranslation.name) AS level
    `;
  }

  private buildUserJson() {
    return `
    CASE 
      WHEN TrainerProfile.userId IS NULL THEN null 
      ELSE JSON_OBJECT(
        'id', TrainerProfile.userId,
        'firstName', User.firstName,
        'lastName', User.lastName,
        'email', User.email,
        'gender', MAX(GenderTranslation.name),
        'birthday', User.birthday,
        'profileImage', User.profileImage,
        'mobileNumber', User.mobileNumber
      ) 
    END AS user
  `;
  }

  private buildAgeGroupJson() {
    return `
    CASE 
      WHEN TrainerProfile.ageGroupId IS NULL THEN null 
      ELSE JSON_OBJECT(
        'id', TrainerProfile.ageGroupId,
        'name', AgeGroup.name
      ) 
    END AS ageGroup
  `;
  }

  private buildRegionJson() {
    return `
    CASE 
      WHEN TrainerProfile.regionId IS NULL THEN null 
      ELSE JSON_OBJECT(
        'id', TrainerProfile.regionId,
        'name', Region.name
      ) 
    END AS region
  `;
  }

  private buildGalleryJson() {
    return `
    CASE 
      WHEN COUNT(DISTINCT Picture.id) = 0 THEN null 
      ELSE CAST(
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT JSON_OBJECT(
              'id', Picture.id,
              'imageLink', Picture.imageLink
            )
          ), 
        ']') AS JSON
      )
    END AS gallery
  `;
  }

  private buildCertificatesJson() {
    return `
    CASE 
      WHEN COUNT(DISTINCT Certificate.id) = 0 THEN null 
      ELSE CAST(
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT JSON_OBJECT(
              'id', Certificate.id,
              'name', Certificate.name,
              'imageLink', Certificate.imageLink
            )
          ), 
        ']') AS JSON
      )
    END AS certificates
  `;
  }

  private buildPackagesJson() {
    return `
    CASE 
      WHEN COUNT(DISTINCT Package.id) = 0 THEN null 
      ELSE CAST(
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT JSON_OBJECT(
              'id', Package.id,
              'name', Package.name,
              'description', Package.description,
              'type', Package.type,
              'price', Package.price,
              'status', Package.status,
              'numberOfSessions', Package.numberOfSessions,
              'ExpirationDate', Package.ExpirationDate,
              'currentAttendeesNumber', Package.currentAttendeesNumber,
              'maxAttendees', Package.maxAttendees,
              'minAttendees', Package.minAttendees,
              'location', packageFieldRegion.name
            )
          ), 
        ']') AS JSON
      )
    END AS packages
  `;
  }

  private buildFieldsJson() {
    return `
    CASE 
      WHEN COUNT(DISTINCT Field.id) = 0 THEN null 
      ELSE CAST(
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT JSON_OBJECT(
              'id', Field.id,
              'name', Field.name
            )
          ), 
        ']') AS JSON
      )
    END AS fields
  `;
  }

  private buildSportsJson() {
    return `
    CASE 
      WHEN COUNT(DISTINCT Sport.id) = 0 THEN null 
      ELSE CAST(
        CONCAT('[', 
          GROUP_CONCAT(
            DISTINCT JSON_OBJECT(
              'id', Sport.id,
              'name', SportTranslation.name
            )
          ), 
        ']') AS JSON
      )
    END AS sports
  `;
  }

  private buildFeedbacksArray(userId: number) {
    return `
    (
      SELECT JSON_ARRAYAGG(feedback)
      FROM Rate
      WHERE trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
        AND feedback IS NOT NULL
      LIMIT 5
    ) AS feedbacks
  `;
  }

  private buildRatingNumber(userId: number) {
    return `
      CASE WHEN AVG(Rate.ratingNumber) IS NULL THEN 5
          ELSE ROUND(AVG(Rate.ratingNumber),1)
        END AS ratingNumber
  `;
  }

  private buildJoins(options: TrainerProfileDetailedOptions): string {
    const joins: string[] = [];

    if (options.includeLevel) {
      joins.push(`
        LEFT JOIN Level ON TrainerProfile.levelId = Level.id
        LEFT JOIN LevelTranslation ON LevelTranslation.levelId = Level.id
          AND LevelTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    if (options.includeUser) {
      joins.push(`
        LEFT JOIN User ON TrainerProfile.userId = User.id
        LEFT JOIN Gender ON User.genderId = Gender.id
        LEFT JOIN GenderTranslation 
          ON GenderTranslation.genderId = Gender.id
          AND GenderTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    if (options.includeAgeGroup) {
      joins.push(`
        LEFT JOIN AgeGroup ON TrainerProfile.ageGroupId = AgeGroup.id
      `);
    }

    if (options.includeRegion) {
      joins.push(`
        LEFT JOIN Region ON TrainerProfile.regionId = Region.id
      `);
    }

    if (options.includeGallery) {
      joins.push(`
        LEFT JOIN Picture ON Picture.trainerProfileId = TrainerProfile.id
      `);
    }

    if (options.includeCertificates) {
      joins.push(`
        LEFT JOIN Certificate ON Certificate.trainerProfileId = TrainerProfile.id
      `);
    }

    if (options.includePackages) {
      joins.push(`
        LEFT JOIN Package ON Package.trainerProfileId = TrainerProfile.id
          AND (Package.status = '${PACKAGE_STATUS.ACTIVE}' OR Package.status = '${PACKAGE_STATUS.PENDING}')
        LEFT JOIN Field AS packageField ON Package.fieldId = packageField.id
        LEFT JOIN Region AS packageFieldRegion ON packageField.regionId = packageFieldRegion.id
      `);
    }

    if (options.includeFields) {
      joins.push(`
        LEFT JOIN TrainerProfileFields ON TrainerProfile.id = TrainerProfileFields.trainerProfileId
        LEFT JOIN Field ON TrainerProfileFields.fieldId = Field.id
      `);
    }

    if (options.includeSports) {
      joins.push(`
        LEFT JOIN TrainerProfileSports ON TrainerProfileSports.trainerProfileId = TrainerProfile.id
        LEFT JOIN Sport ON TrainerProfileSports.sportId = Sport.id
        LEFT JOIN SportTranslation ON SportTranslation.sportId = Sport.id
          AND SportTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    if (options.includeFeedbacks) {
      joins.push(`
        LEFT JOIN Rate ON Rate.trainerProfileId = TrainerProfile.id
      `);
    }

    return joins.join('\n');
  }
}
