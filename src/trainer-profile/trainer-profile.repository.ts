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

@Injectable()
export class TrainerProfileRepository {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private sportService: SportService,
    private globalService: GlobalService,
    private globalRepository: GlobalRepository,
  ) {}

  async getByID(id: number): Promise<ReturnTrainerProfileDto> {
    let trainerProfile = await this.prisma.$queryRaw`
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
    WHERE tp.id = ${id}
    LIMIT 1
    ;`;

    if (!trainerProfile[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.TRAINER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return trainerProfile[0];
  }

  async getByUserId(userId: number): Promise<ReturnTrainerProfileDto> {
    let trainerProfile = await this.prisma.$queryRaw`
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
    WHERE tp.userId = ${userId}
    LIMIT 1
    ;`;

    if (!trainerProfile[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.TRAINER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return trainerProfile[0];
  }

  async getOneDetailed(userId: number): Promise<ReturnTrainerProfileDetailsDto> {
    let trainerProfileDetails: ReturnTrainerProfileDetailsDto = await this.prisma
      .$queryRaw`
    WITH userDetails AS (
      SELECT
      User.id,
      firstName,
      lastName,
      email,
      profileImage,
      mobileNumber,
      GenderTranslation.name AS gender,
      birthday
      FROM User
      LEFT JOIN Gender ON User.genderId = Gender.id
      LEFT JOIN GenderTranslation
      ON GenderTranslation.genderId = Gender.id
      AND GenderTranslation.language = ${I18nContext.current().lang}
      WHERE User.id = ${userId}
    ),
      TrainerPictures AS(
        SELECT fivePictures.trainerProfileId,
        CASE WHEN COUNT(fivePictures.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fivePictures.id,
          'imageLink', fivePictures.imageLink
          ))
        END AS pictures
        From (
          SELECT
          Picture.id AS id,
          Picture.trainerProfileId AS trainerProfileId,
          Picture.imageLink AS imageLink
          FROM Picture
          WHERE trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
          LIMIT 5
        ) AS fivePictures
        GROUP BY fivePictures.trainerProfileId
      ),
      TrainerCertificates AS(
        SELECT fiveCertificates.trainerProfileId,
        CASE WHEN COUNT(fiveCertificates.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',fiveCertificates.id,
          'name',fiveCertificates.name,
          'imageLink', fiveCertificates.imageLink
          ))
        END AS certificates
        From (
          SELECT
          Certificate.id AS id,
          Certificate.trainerProfileId AS trainerProfileId,
          Certificate.name AS name,
          Certificate.imageLink AS imageLink
          FROM Certificate
          WHERE trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
          LIMIT 5
        ) AS fiveCertificates
        GROUP BY fiveCertificates.trainerProfileId
      ),
      RatingAvgTable AS (
        SELECT r.trainerProfileId AS trainerProfileId,
        CASE WHEN AVG(r.ratingNumber) IS NULL THEN 5
        ELSE
        ROUND(AVG(r.ratingNumber),1)
        END AS ratingNumber
        FROM Rate AS r
        WHERE r.trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
        GROUP BY r.trainerProfileId
      ),
      Last5Feedbacks AS (
        SELECT
        feedback
        FROM Rate
        WHERE trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
        && feedback IS NOT NULL
        LIMIT 5
      ),
    trainerProfileFields AS (
      SELECT
      tp.id AS trainerProfileId,
      CASE 
      WHEN COUNT(f.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',f.id,
        'name', f.name)) 
      END AS fields
      FROM TrainerProfile AS tp
      LEFT JOIN TrainerProfileFields AS tpf ON tp.id = tpf.trainerProfileId
      LEFT JOIN Field AS f ON tpf.fieldId = f.id
      WHERE userId = ${userId} 
      GROUP BY tp.id
    ),
    trainerProfileWithSports AS (
    SELECT
    tp.id AS trainerProfileId,
    MAX(LevelTranslation.name) AS level,
    CASE 
    WHEN COUNT(ag.id ) = 0 THEN null
    ELSE
    JSON_OBJECT(
      'id',ag.id,
      'name', MAX(AgeGroupTranslation.name)
      )
    END AS ageGroup,
    tp.cost AS cost,
    tp.hoursPriorToBooking AS hoursPriorToBooking,
    tp.sessionDescription AS sessionDescription,
    tp.regionId AS regionId,
    tp.userId AS userId,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',s.id,
      'name', SportTranslation.name)) 
    END AS sports
    FROM TrainerProfile AS tp
    LEFT JOIN Level ON tp.levelId = Level.id
    LEFT JOIN LevelTranslation ON LevelTranslation.levelId = Level.id
    AND LevelTranslation.language = ${I18nContext.current().lang}
    LEFT JOIN TrainerProfileSports AS tps ON tp.id = tps.trainerProfileId
    LEFT JOIN Sport AS s ON tps.sportId = s.id
    LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
    LEFT JOIN AgeGroup AS ag ON tp.ageGroupId = ag.id
    LEFT JOIN AgeGroupTranslation
      ON AgeGroupTranslation.ageGroupId = ag.id
      AND AgeGroupTranslation.language = ${I18nContext.current().lang}
    WHERE tp.userId = ${userId}
    GROUP BY tp.id
    LIMIT 1
    )
    SELECT
    tpws.trainerProfileId AS id,
    tpws.level AS level,
    tpws.cost AS cost,
    tpws.hoursPriorToBooking AS hoursPriorToBooking,
    tpws.ageGroup AS ageGroup,
    tpws.sessionDescription AS sessionDescription,
    CASE 
      WHEN count(r.id) = 0 THEN null
      ELSE
      JSON_OBJECT(
        'id',r.id,
        'name', MAX(RegionTranslation.name)
        )
    END AS region,
    JSON_OBJECT(
      'id',ud.id,
      'firstName',ud.firstName,
      'lastName', ud.lastName,
      'email',ud.email,
      'profileImage', ud.profileImage,
      'mobileNudmber',ud.mobileNumber,
      'gender', MAX(ud.gender),
      'birthday',ud.birthday
      ) AS user,
    (SELECT pictures FROM TrainerPictures ) AS gallery,
    (SELECT certificates FROM TrainerCertificates ) AS certificates,
    (SELECT ratingNumber FROM RatingAvgTable) AS ratingNumber,
    (SELECT JSON_ARRAYAGG(feedback) FROM Last5Feedbacks) AS feedbacks,
    tpws.sports AS sports,
    tpf.fields AS fields
    FROM
    trainerProfileWithSports AS tpws
    LEFT JOIN userDetails AS ud ON tpws.userId = ud.id
    LEFT JOIN trainerProfileFields AS tpf ON tpws.trainerProfileId = tpf.trainerProfileId
    LEFT JOIN Region AS r ON tpws.regionId = r.id
    LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = r.id
    AND RegionTranslation.language = ${I18nContext.current().lang}
    GROUP BY tpws.trainerProfileId
    ;`;
    return trainerProfileDetails[0];
  }

  async getSchedulesIds(userId: number): Promise<number[]> {
    let trainerProfile = await this.getByUserId(userId);

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
    await this.getByID(trainerProfileId);
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
  ): Promise<ReturnTrainerProfileDto> {
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

    let newTrainerProfile = await this.getByUserId(userId);

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
    let theTrainerProfile = await this.getByUserId(userId);
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
      return await this.getByID(trainerProfileId);
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

    return await this.getByID(trainerProfileId);
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

  // async deletePastBookedSession(trainerProfileId: number) {

  // }

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
}
