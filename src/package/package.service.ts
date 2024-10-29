import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PackageCreateDto } from './dtos/package-create.dto';
import { PackageReturnDto } from './dtos/package-return.dto';
import { PackageRepository } from './package.repository';
import { TrainerProfileRepository } from 'src/trainer-profile/trainer-profile.repository';
import moment from 'moment-timezone';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TrainerScheduleService } from 'src/trainer-schedule/trainer-schedule.service';
import { TrainerScheduleRepository } from 'src/trainer-schedule/trainer-schedule.repository';
import { ConfigService } from '@nestjs/config';
import { SessionDateTimeDto } from './dtos/session-date-time.dto';
import { ScheduleSlotsDetailsDTO } from 'src/trainer-schedule/dtos/schedule-slots-details';
import { PlayerProfileRepository } from 'src/player-profile/player-profile.repository';
import { ReturnPlayerProfileDto } from 'src/player-profile/dtos/return.dto';
import { PACKAGE_STATUS } from 'src/global/enums';
import { FieldRepository } from 'src/field/field.repository';
import { FIND_BY } from 'src/trainer-profile/trainer-profile-enums';
import { FIND_BY as playerProfileFindBy } from '../player-profile/player-profile-enums';

@Injectable()
export class PackageService {
  constructor(
    private readonly i18n: I18nService,
    private packageRepository: PackageRepository,
    private trainerProfileRepository: TrainerProfileRepository,
    private trainerScheduleService: TrainerScheduleService,
    private trainerScheduleRepository: TrainerScheduleRepository,
    private playerProfileRepository: PlayerProfileRepository,
    private fieldRepository: FieldRepository,
    private configService: ConfigService,
  ) {}

  async create(reqBody: PackageCreateDto, userId: number): Promise<PackageReturnDto> {
    // validate field existance
    // ??????????
    // validate flexible package having a schedule
    if (reqBody.type === 'flexible' && reqBody.sessionsDateTime) {
      throw new BadRequestException(
        this.i18n.t(`errors.FLEXIBLE_PACKAGE_SCHEDULE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    if (reqBody.type === 'schedule' && !reqBody.sessionsDateTime) {
      throw new BadRequestException(
        this.i18n.t(`errors.SCHEDULE_PACKAGE_SCHEDULE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (reqBody.type === 'schedule' && (!reqBody.minAttendees || !reqBody.maxAttendees)) {
      throw new BadRequestException(
        this.i18n.t(`errors.SCHEDULE_PACKAGE_ATTENDEES`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (reqBody.type === 'schedule' && (!reqBody.fieldId || !reqBody.secondaryFieldId)) {
      throw new BadRequestException(
        this.i18n.t(`errors.SCHEDULE_PACKAGE_FIELDS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    let trainerProfile = await this.trainerProfileRepository.findBy(
      FIND_BY.USER_ID,
      userId,
    );

    let scheduleId = await this.trainerScheduleRepository.getTrainerScheduleId(
      trainerProfile.id,
    );

    let trainerSchedule = await this.trainerScheduleService.getOne(
      this.configService.getOrThrow('TZ'),
      userId,
      scheduleId,
    );

    //validate fields existance if schedule
    if (reqBody.type === 'schedule') {
      // validate first field
      await this.fieldRepository.getByID(reqBody.fieldId);

      await this.fieldRepository.getByID(reqBody.secondaryFieldId);
    }

    if (reqBody.sessionsDateTime) {
      //validate number of sessions = length of sessionsDateTime[]
      if (reqBody.numberOfSessions != reqBody.sessionsDateTime.length) {
        console.log('-- reqBody.numberOfSessions != reqBody.sessionsDateTime.length --');
        throw new BadRequestException(
          this.i18n.t(`errors.INVALID_PACKAGE_SESSIONS`, {
            lang: I18nContext.current().lang,
          }),
        );
      }

      await this.validateCreatePackage(trainerSchedule, reqBody.sessionsDateTime);

      reqBody.sessionsDateTime = reqBody.sessionsDateTime.map((item) => {
        return {
          date: moment(item.date).format('YYYY-MM-DD'),
          fromTime: moment(`${item.date} ${item.fromTime}`).toISOString(),
          toTime: moment(`${item.date} ${item.toTime}`).toISOString(),
        };
      });
    }
    // return true;

    return await this.packageRepository.create(reqBody, trainerProfile.id);
  }

  async GetOne(packageId: number, userId: number): Promise<PackageReturnDto> {
    await this.authorizeResource(packageId, userId);
    return await this.packageRepository.getOneById(packageId);
  }

  async activatePackage(packageId: number, userId: number) {
    await this.authorizeResource(packageId, userId);
    // validate if its already active
    let thePackage = await this.packageRepository.getOneById(packageId);
    if (thePackage.status == PACKAGE_STATUS.ACTIVE) {
      throw new BadRequestException(
        this.i18n.t(`errors.PACKAGE_ALREADY_ACTIVE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (thePackage.status == PACKAGE_STATUS.EXPIRED) {
      throw new BadRequestException(
        this.i18n.t(`errors.EXPIRED_PACKAGE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    await this.packageRepository.updatePackageStatus(packageId, PACKAGE_STATUS.ACTIVE);
    return true;
  }

  async cancelPackage(packageId: number, userId: number) {
    await this.authorizeResource(packageId, userId);
    // validate if its already canceled
    let thePackage = await this.packageRepository.getOneById(packageId);
    if (thePackage.status == PACKAGE_STATUS.EXPIRED) {
      throw new BadRequestException(
        this.i18n.t(`errors.EXPIRED_PACKAGE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    await this.packageRepository.deletePackage(packageId);

    //notify player about package cancellation and return the money

    return true;
  }

  async playerBookTrainerPackage(
    userId: number,
    trainerProfileId: number,
    packageId: number,
  ) {
    // validate the package belong to the trainerProfile
    let thePackage = await this.packageRepository.getOneById(packageId);
    let theTrainerProfile = await this.trainerProfileRepository.findBy(
      FIND_BY.ID,
      trainerProfileId,
    );

    let thePlayerProfile = await this.playerProfileRepository.getOneDetailedBy(
      playerProfileFindBy.USER_ID,
      userId,
      { level: true, sports: true, user: true, region: true, packages: true },
    );

    console.log('thePackage', thePackage);
    console.log('theTrainerProfile', theTrainerProfile);
    console.log('thePlayerProfile', thePlayerProfile);

    if (thePackage.trainerProfileId != theTrainerProfile.id) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_BELONG_RESOURCE`, { lang: I18nContext.current().lang }),
      );
    }

    if (userId == theTrainerProfile.userId) {
      throw new ForbiddenException(
        this.i18n.t(`errors.CANT_BOOK_YOUR_PACKAGE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    await this.validateBookPackage(userId, thePackage);

    //save player to package
    await this.savePlayerToPackage(thePackage, thePlayerProfile);
    return true;
  }

  async savePlayerToPackage(
    thePackage: PackageReturnDto,
    playerProfile: ReturnPlayerProfileDto,
  ) {
    await this.packageRepository.createPlayerPackageRelation(
      thePackage.id,
      playerProfile.id,
    );

    let updatedPackage =
      await this.packageRepository.addOneToPackageCurrentAttendeesNumber(thePackage.id);

    if ((updatedPackage.currentAttendeesNumber = updatedPackage.maxAttendees)) {
      await this.packageRepository.updatePackageStatus(
        thePackage.id,
        PACKAGE_STATUS.ACTIVE,
      );
    }

    // if package is schedule; save its future sessions to user schedule
    if (thePackage.type === 'schedule') {
      await this.trainerScheduleService.savePackageSessions(
        playerProfile.userId,
        thePackage,
      );
    }

    return true;
  }

  private async authorizeResource(packageId: number, userId: number): Promise<any> {
    //get pacakge
    let thePackage = await this.packageRepository.getOneById(packageId);
    if (!thePackage) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let currentUserTrainerProfile = await this.trainerProfileRepository.findBy(
      FIND_BY.USER_ID,
      userId,
    );
    if (thePackage.trainerProfileId != currentUserTrainerProfile.id) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async validateBookPackage(userId: number, thePackage: PackageReturnDto) {
    let thePlayerProfile = await this.playerProfileRepository.getOneDetailedBy(
      playerProfileFindBy.USER_ID,
      userId,
      { level: true, sports: true, user: true, region: true, packages: true },
    );

    //check package current attendees < maxAttendees
    if (thePackage.currentAttendeesNumber >= thePackage.maxAttendees) {
      throw new BadRequestException(
        this.i18n.t(`errors.PACKAGE_FULL`, { lang: I18nContext.current().lang }),
      );
    }

    // check if the player already in the package
    if (
      await this.packageRepository.PlayerHasPackageRelation(
        thePackage.id,
        thePlayerProfile.id,
      )
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.PLAYER_PACKAGE_EXIST`, { lang: I18nContext.current().lang }),
      );
    }

    // check package expiration date
    if (moment() >= moment(thePackage.ExpirationDate)) {
      console.log('current moment():', moment());

      await this.packageRepository.updatePackageStatus(
        thePackage.id,
        PACKAGE_STATUS.EXPIRED,
      );
      throw new BadRequestException(
        this.i18n.t(`errors.PACKAGE_EXPIRED`, { lang: I18nContext.current().lang }),
      );
    }
    // return true;
    if (thePackage.type === 'schedule') {
      for (let index = 0; index < thePackage.sessionsDateTime.length; index++) {
        let packageSlot = thePackage.sessionsDateTime[index];
        let sessionDate = moment(packageSlot.date).format('YYYY-MM-DD');
        console.log('sessionDate:', sessionDate);

        let playerSessionsThisDay =
          await this.trainerScheduleRepository.getUserBookedTimes(userId, sessionDate);
        console.log('playerSessionsThisDay:', playerSessionsThisDay);

        playerSessionsThisDay.forEach((playerSession) => {
          //check if they have intersected time
          let packageSlotFromTimeObject = moment(
            `${packageSlot.date} ${packageSlot.fromTime}`,
          )
            .tz(this.configService.getOrThrow('TZ'))
            .format('HH:mm');

          let packageSlotToTimeObject = moment(
            `${packageSlot.date} ${packageSlot.toTime}`,
          )
            .tz(this.configService.getOrThrow('TZ'))
            .format('HH:mm');

          console.log('------------times-------------');

          let packageSlotFromTime = moment(packageSlotFromTimeObject, 'HH:mm');
          console.log('packageSlotFromTime:', packageSlotFromTime);

          let packageSlotToTime = moment(packageSlotToTimeObject, 'HH:mm');
          console.log('packageSlotToTime:', packageSlotToTime);

          console.log('-------------------------');

          let scheduleSlotFromTime = moment(playerSession.fromTime, 'HH:mm');
          console.log('scheduleSlot.fromTime:', moment(playerSession.fromTime, 'HH:mm'));

          let scheduleSlotToTime = moment(playerSession.toTime, 'HH:mm');
          console.log('scheduleSlot.toTime:', moment(playerSession.toTime, 'HH:mm'));

          console.log('-------------------------');

          let intersects =
            (scheduleSlotFromTime >= packageSlotFromTime &&
              scheduleSlotFromTime < packageSlotToTime) ||
            (packageSlotFromTime >= scheduleSlotFromTime &&
              packageSlotFromTime < scheduleSlotToTime);

          if (intersects) {
            console.log('-- package intersects with player schedule error --');

            throw new BadRequestException(
              this.i18n.t(`errors.BOOKED_TIME`, {
                lang: I18nContext.current().lang,
              }),
            );
          }
        });
      }
    }
  }

  private async validateTrainerPastPackages(
    trainerSchedule: ScheduleSlotsDetailsDTO,
    sessionsDateTime: SessionDateTimeDto[],
  ) {
    // ............................................
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');

    let trainerExistingPackagesDatesTimes =
      await this.packageRepository.getTrainerPackagesDatesTimes(
        trainerSchedule.trainerProfileId,
      );

    if (
      !trainerExistingPackagesDatesTimes ||
      trainerExistingPackagesDatesTimes.length === 0
    ) {
      return true;
    }
    trainerExistingPackagesDatesTimes = trainerExistingPackagesDatesTimes.flat();

    console.log('trainerExistingPackagesDatesTimes:', trainerExistingPackagesDatesTimes);

    sessionsDateTime.forEach((newPackageSession) => {
      let newPackageSessionDate = moment(newPackageSession.date).format('YYYY-MM-DD');

      // compare it with same date sessions
      trainerExistingPackagesDatesTimes.forEach((existingPackageSession) => {
        let existingPackageSessionDate = moment(existingPackageSession.date).format(
          'YYYY-MM-DD',
        );

        // console.log('existingPackageSessionDate:', existingPackageSessionDate);

        if (existingPackageSessionDate === newPackageSessionDate) {
          let newPackageSessionStartDateTime = moment(
            `${newPackageSession.date} ${newPackageSession.fromTime}`,
          ).tz(this.configService.getOrThrow('TZ'));

          console.log('newPackageSessionStartDateTime:', newPackageSessionStartDateTime);

          let newPackageSessionEndDateTime = moment(
            `${newPackageSession.date} ${newPackageSession.toTime}`,
          ).tz(this.configService.getOrThrow('TZ'));

          newPackageSessionStartDateTime = moment(
            newPackageSessionStartDateTime,
            'HH:mm',
          );

          newPackageSessionEndDateTime = moment(newPackageSessionEndDateTime, 'HH:mm');

          let existingPackageFromTime = moment(existingPackageSession.fromTime);

          existingPackageFromTime = moment(existingPackageFromTime, 'HH:mm');

          let existingPackageToTime = moment(existingPackageSession.toTime);

          existingPackageToTime = moment(existingPackageToTime, 'HH:mm');

          let intersects =
            (existingPackageFromTime >= newPackageSessionStartDateTime &&
              existingPackageFromTime < newPackageSessionEndDateTime) ||
            (newPackageSessionStartDateTime >= existingPackageFromTime &&
              newPackageSessionStartDateTime < existingPackageToTime);

          if (intersects) {
            console.log('-- package intersects with trainer past packages error --');

            throw new BadRequestException(
              this.i18n.t(`errors.INVALID_PACKAGE_SCHEDULE_TRAINER_PACKAGES`, {
                lang: I18nContext.current().lang,
              }),
            );
          }
        }
      });
    });

    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    // --------------------------------------------

    return true;
  }

  private async validateCreatePackage(
    trainerSchedule: ScheduleSlotsDetailsDTO,
    sessionsDateTime: SessionDateTimeDto[],
  ) {
    await this.validateTrainerPastPackages(trainerSchedule, sessionsDateTime);

    // get all dates months from reqBody
    let packageMonths = sessionsDateTime.map((item) => {
      return moment(item.date).month() + 1;
    });

    // check if package months are in trainer schedule
    if (trainerSchedule.scheduleMonths.some((item) => packageMonths.includes(item))) {
      let commonMonths = trainerSchedule.scheduleMonths.filter((item) =>
        packageMonths.includes(item),
      );
      console.log('commonMonths:', commonMonths);

      // check if package days are in trainer schedule

      let trainerScheduleSlotsDaysNumbers = trainerSchedule.ScheduleSlots.map((item) => {
        return item.weekDayNumber;
      });

      let packageDaysNumbers = sessionsDateTime.map((item) => {
        return moment(item.date).day();
      });

      if (
        trainerScheduleSlotsDaysNumbers.some((item) => packageDaysNumbers.includes(item))
      ) {
        let commonDayNumbers = trainerScheduleSlotsDaysNumbers.filter((item) =>
          packageDaysNumbers.includes(item),
        );
        console.log('commonDayNumbers:', commonDayNumbers);
        ///////////////////

        console.log('-------------------------');
        console.log('all trainer schedule slots:', trainerSchedule.ScheduleSlots);
        console.log('-------------------------');

        sessionsDateTime.forEach((packageSlot) => {
          //validate fromTime is before toTime
          if (moment(packageSlot.fromTime).isAfter(packageSlot.toTime)) {
            console.log('-- fromTime is after toTime error --');

            throw new BadRequestException(
              this.i18n.t(`errors.INVALID_PACKAGE_SCHEDULE`, {
                lang: I18nContext.current().lang,
              }),
            );
          }

          console.log('---------------- PackageDateTime --------------------');

          //get schedule slots with the same weekday
          console.log('packgeWeekDayNumber:', moment(packageSlot.date).weekday());

          let sameWeekDaySlots = trainerSchedule.ScheduleSlots.filter((item) => {
            return item.weekDayNumber === moment(packageSlot.date).weekday();
          });

          console.log('sameWeekDaySlots:', sameWeekDaySlots);

          sameWeekDaySlots.forEach((scheduleSlot) => {
            //check if they have intersected time
            let packageSlotFromTimeObject = moment(
              `${packageSlot.date} ${packageSlot.fromTime}`,
            )
              .tz(this.configService.getOrThrow('TZ'))
              .format('HH:mm');

            console.log('packageSlotFromTimeObject:', packageSlotFromTimeObject);

            let packageSlotToTimeObject = moment(
              `${packageSlot.date} ${packageSlot.toTime}`,
            )
              .tz(this.configService.getOrThrow('TZ'))
              .format('HH:mm');

            console.log('packageSlotToTimeObject:', packageSlotToTimeObject);

            console.log('------------times-------------');

            let packageSlotFromTime = moment(packageSlotFromTimeObject, 'HH:mm');
            console.log('packageSlotFromTime:', packageSlotFromTime);

            let packageSlotToTime = moment(packageSlotToTimeObject, 'HH:mm');
            console.log('packageSlotToTime:', packageSlotToTime);

            console.log('-------------------------');

            let scheduleSlotFromTime = moment(scheduleSlot.fromTime, 'HH:mm');
            console.log('scheduleSlot.fromTime:', moment(scheduleSlot.fromTime, 'HH:mm'));

            let scheduleSlotToTime = moment(scheduleSlot.toTime, 'HH:mm');
            console.log('scheduleSlot.toTime:', moment(scheduleSlot.toTime, 'HH:mm'));

            console.log('-------------------------');

            let intersects =
              (scheduleSlotFromTime >= packageSlotFromTime &&
                scheduleSlotFromTime < packageSlotToTime) ||
              (packageSlotFromTime >= scheduleSlotFromTime &&
                packageSlotFromTime < scheduleSlotToTime);

            if (intersects) {
              console.log('-- package intersects with trainer schedule error --');

              throw new BadRequestException(
                this.i18n.t(`errors.INVALID_PACKAGE_SCHEDULE`, {
                  lang: I18nContext.current().lang,
                }),
              );
            }
          });
        });
      }
    }
  }
}
