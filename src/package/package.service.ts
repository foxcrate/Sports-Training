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

@Injectable()
export class PackageService {
  constructor(
    private readonly i18n: I18nService,
    private packageRepository: PackageRepository,
    private trainerProfileRepository: TrainerProfileRepository,
    private trainerScheduleService: TrainerScheduleService,
    private trainerScheduleRepository: TrainerScheduleRepository,
    private configService: ConfigService,
  ) {}

  async create(reqBody: PackageCreateDto, userId: number): Promise<PackageReturnDto> {
    let trainerProfile = await this.trainerProfileRepository.getByUserId(userId);

    let scheduleId = await this.trainerScheduleRepository.getTrainerScheduleId(
      trainerProfile.id,
    );

    let trainerSchedule = await this.trainerScheduleService.getOne(
      this.configService.getOrThrow('TZ'),
      userId,
      scheduleId,
    );

    await this.validateCreatePackage(trainerSchedule, reqBody.sessionsDateTime);
    //
    // return true;

    reqBody.sessionsDateTime = reqBody.sessionsDateTime.map((item) => {
      return {
        fromDateTime: moment(item.fromDateTime).toISOString(),
        toDateTime: moment(item.toDateTime).toISOString(),
      };
    });

    return await this.packageRepository.create(reqBody, trainerProfile.id);
  }

  async GetOne(packageId: number, userId: number): Promise<PackageReturnDto> {
    await this.authorizeResource(packageId, userId);
    return await this.packageRepository.getOneById(packageId);
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

  private async validateCreatePackage(
    trainerSchedule: ScheduleSlotsDetailsDTO,
    sessionsDateTime: SessionDateTimeDto[],
  ) {
    // get all dates months from reqBody

    let packageMonths = sessionsDateTime.map((item) => {
      return moment(item.fromDateTime).month() + 1;
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
        return moment(item.fromDateTime).day();
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
          console.log('---------------- PackageDateTime --------------------');

          //get schedule slots with the same weekday
          console.log(
            'pacakgeWeekDayNumber:',
            moment(packageSlot.fromDateTime).weekday(),
          );

          let sameWeekDaySlots = trainerSchedule.ScheduleSlots.filter((item) => {
            return item.weekDayNumber === moment(packageSlot.fromDateTime).weekday();
          });

          console.log('sameWeekDaySlots:', sameWeekDaySlots);

          sameWeekDaySlots.forEach((scheduleSlot) => {
            //check if they have intersected time
            let packageSlotFromTimeObject = moment(packageSlot.fromDateTime)
              .tz(this.configService.getOrThrow('TZ'))
              .format('HH:mm');

            let packageSlotToTimeObject = moment(packageSlot.toDateTime)
              .tz(this.configService.getOrThrow('TZ'))
              .format('HH:mm');

            console.log('------------times-------------');

            let packageSlotFromTime = moment(packageSlotFromTimeObject, 'HH:mm');
            console.log(packageSlotFromTime);

            let packageSlotToTime = moment(packageSlotToTimeObject, 'HH:mm');
            console.log('packageSlotToTime:', packageSlotToTime);

            console.log('-------------------------');

            let scheduleSlotFromTime = moment(scheduleSlot.fromTime, 'HH:mm');
            console.log('scheduleSlot.fromTime:', moment(scheduleSlot.fromTime, 'HH:mm'));

            let scheduleSlotToTime = moment(scheduleSlot.toTime, 'HH:mm');
            console.log('scheduleSlot.toTime:', moment(scheduleSlot.toTime, 'HH:mm'));

            console.log('-------------------------');

            // const intersects =
            //   moment(packageSlotFromTime, 'HH:mm').isBefore(
            //     moment(scheduleSlot.toTime, 'HH:mm'),
            //   ) &&
            //   moment(packageSlotToTime, 'HH:mm').isAfter(
            //     moment(scheduleSlot.fromTime, 'HH:mm'),
            //   );

            let intersects =
              (scheduleSlotFromTime >= packageSlotFromTime &&
                scheduleSlotFromTime < packageSlotToTime) ||
              (packageSlotFromTime >= scheduleSlotFromTime &&
                packageSlotFromTime < scheduleSlotToTime);

            if (intersects) {
              throw new BadRequestException(
                this.i18n.t(`errors.INVALID_PACKAGE_SCHEDULE`, {
                  lang: I18nContext.current().lang,
                }),
              );
            }

            // if (
            //   moment(packageSlotTime, 'HH:mm').isBetween(
            //     moment(scheduleSlot.fromTime, 'HH:mm'),
            //     moment(scheduleSlot.toTime, 'HH:mm'),
            //   )
            // ) {
            //   throw new BadRequestException(
            //     this.i18n.t(`errors.INVALID_PACKAGE_SCHEDULE`, {
            //       lang: I18nContext.current().lang,
            //     }),
            //   );
            // }
          });
        });
      }
    }
  }
}
