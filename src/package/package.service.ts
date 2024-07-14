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

@Injectable()
export class PackageService {
  constructor(
    private readonly i18n: I18nService,
    private packageRepository: PackageRepository,
    private trainerProfileRepository: TrainerProfileRepository,
    private trainerScheduleService: TrainerScheduleService,
    private trainerScheduleRepository: TrainerScheduleRepository,
    private playerProfileRepository: PlayerProfileRepository,
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

    let trainerProfile = await this.trainerProfileRepository.getByUserId(userId);

    let scheduleId = await this.trainerScheduleRepository.getTrainerScheduleId(
      trainerProfile.id,
    );

    let trainerSchedule = await this.trainerScheduleService.getOne(
      this.configService.getOrThrow('TZ'),
      userId,
      scheduleId,
    );

    if (reqBody.sessionsDateTime) {
      //validate number of sessions = length of sessionsDateTime[]
      if (reqBody.numberOfSessions != reqBody.sessionsDateTime.length) {
        console.log('-- reqBody.numberOfSessions != reqBody.sessionsDateTime.length --');
        throw new BadRequestException(
          this.i18n.t(`errors.INVALID_PACKAGE_SCHEDULE`, {
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

    return await this.packageRepository.create(reqBody, trainerProfile.id);
  }

  async GetOne(packageId: number, userId: number): Promise<PackageReturnDto> {
    await this.authorizeResource(packageId, userId);
    return await this.packageRepository.getOneById(packageId);
  }

  async playerBookTrainerPackage(
    userId: number,
    trainerProfileId: number,
    packageId: number,
  ) {
    // validate the package belong to the trainerProfile
    let thePackage = await this.packageRepository.getOneById(packageId);
    let theTrainerProfile = await this.trainerProfileRepository.getByID(trainerProfileId);
    let thePlayerProfile =
      await this.playerProfileRepository.getOneDetailedByUserId(userId);

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

    // if package in a schedule package; validate the player schedule relative to package schedule
    if (thePackage.type === 'schedule') {
      await this.validateBookPackage(userId, thePackage);
    }
    return true;
    //save the booking
  }

  private async authorizeResource(packageId: number, userId: number): Promise<any> {
    //get pacakge
    let thePackage = await this.packageRepository.getOneById(packageId);
    if (!thePackage) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let currentUserTrainerProfile =
      await this.trainerProfileRepository.getByUserId(userId);
    if (thePackage.trainerProfileId != currentUserTrainerProfile.id) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async validateBookPackage(userId: number, thePackage: PackageReturnDto) {
    for (let index = 0; index < thePackage.sessionsDateTime.length; index++) {
      let sessionDate = moment(thePackage.sessionsDateTime[index].date).format(
        'YYYY-MM-DD',
      );
      console.log('sessionDate:', sessionDate);

      let playerSessionsThisDay = await this.trainerScheduleRepository.getUserBookedTimes(
        userId,
        sessionDate,
      );
      console.log('playerSessionsThisDay:', playerSessionsThisDay);
    }
  }

  private async validateCreatePackage(
    trainerSchedule: ScheduleSlotsDetailsDTO,
    sessionsDateTime: SessionDateTimeDto[],
  ) {
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
