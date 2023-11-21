import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { ScheduleModel } from './schedule.model';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { TrainerProfileModel } from 'src/trainer-profile/trainer-profile.model';
import { ReturnScheduleDto } from './dtos/return.dto';
import { ScheduleCreateDto } from './dtos/create.dto';
import { SlotDetailsDto } from './dtos/slot-details.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class ScheduleService {
  constructor(
    private scheduleModel: ScheduleModel,
    private prisma: PrismaService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
    private trainerProfileModel: TrainerProfileModel,
  ) {}

  async getAll(userId: number): Promise<ScheduleSlotsDetailsDTO[]> {
    //get user traienr profile
    let trainerProfile = await this.trainerProfileModel.getByUserId(userId);

    return await this.scheduleModel.getAll(trainerProfile.id);
  }

  async getOne(
    timezone: string,
    userId: number,
    scheduleId: number,
  ): Promise<ScheduleSlotsDetailsDTO> {
    return await this.authorizeResource(timezone, userId, scheduleId);
  }

  async create(timezone, userId: number, reqBody: ScheduleCreateDto): Promise<any> {
    let trainerProfile = await this.trainerProfileModel.getByUserId(userId);
    reqBody.slots = this.slotsTimeTo24(reqBody.slots);
    await this.validateCreateScheduleMonths(trainerProfile.id, reqBody);
    this.groupingAndValidatingScheduleSlots(reqBody.slots);
    return await this.scheduleModel.create(timezone, trainerProfile.id, reqBody);
  }

  async delete(
    timezone,
    userId: number,
    scheduleId: number,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let theSchedule = await this.authorizeResource(timezone, userId, scheduleId);
    return await this.scheduleModel.deleteByID(timezone, theSchedule.id);
  }

  async update(
    timezone: string,
    userId: number,
    scheduleId: number,
    reqBody: ScheduleCreateDto,
  ): Promise<any> {
    let schedule = await this.authorizeResource(timezone, userId, scheduleId);
    await this.validateUpdateScheduleMonths(
      schedule.id,
      schedule.trainerProfileId,
      reqBody,
    );
    this.groupingAndValidatingScheduleSlots(reqBody.slots);
    return await this.scheduleModel.update(timezone, schedule.id, reqBody);
  }

  private slotsTimeTo24(slotsArray: SlotDetailsDto[]) {
    return slotsArray.map((slot) => {
      slot.fromTime = this.globalService.timeTo24(slot.fromTime);
      slot.toTime = this.globalService.timeTo24(slot.toTime);
      return slot;
    });
  }

  private async authorizeResource(
    timezone,
    userId: number,
    scheduleId: number,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let schedule = await this.scheduleModel.getByID(timezone, scheduleId);

    let schedulesIds = await this.trainerProfileModel.getSchedulesIds(userId);

    if (!schedulesIds.includes(schedule.id)) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    return schedule;
  }

  private async validateCreateScheduleMonths(
    trainerProfileId: number,
    reqBody: ScheduleCreateDto,
  ) {
    //get all trainer schedule months
    let allTrainerSchedulesMonths =
      await this.scheduleModel.allTrainerSchedulesMonths(trainerProfileId);

    //check intersecting months

    for (let i = 0; i < reqBody.months.length; i++) {
      if (allTrainerSchedulesMonths.includes(reqBody.months[i])) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_SCHEDULED_MONTH`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }

    return true;
  }

  private async validateUpdateScheduleMonths(
    scheduleId: number,
    trainerProfileId: number,
    reqBody: ScheduleCreateDto,
  ) {
    //get all trainer schedule months except the desired update schedule
    let allTrainerSchedulesMonthsExceptOne =
      await this.scheduleModel.allTrainerSchedulesMonthsExceptOne(
        scheduleId,
        trainerProfileId,
      );

    //check intersecting months

    for (let i = 0; i < reqBody.months.length; i++) {
      if (allTrainerSchedulesMonthsExceptOne.includes(reqBody.months[i])) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_SCHEDULED_MONTH`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }

    return true;
  }

  private groupingAndValidatingScheduleSlots(slots: SlotDetailsDto[]) {
    let slotsGroupedByDay = this.groupSlotsByWeekday(slots);

    for (const key in slotsGroupedByDay) {
      if (slotsGroupedByDay.hasOwnProperty(key)) {
        console.log(`key: ${key}`);
        console.log(slotsGroupedByDay[key]);
        this.validateScheduleSlots(slotsGroupedByDay[key]);
      }
    }
  }

  private validateScheduleSlots(slots: SlotDetailsDto[]) {
    for (let i = 0; i < slots.length; i++) {
      var slot1 = slots[i];
      var fromTime1 = moment(`1970-01-01T${slot1.fromTime}:00Z`);
      var toTime1 = moment(`1970-01-01T${slot1.toTime}:00Z`);
      if (toTime1 < fromTime1) {
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_SLOT_TIMING`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
      for (let j = i + 1; j < slots.length; j++) {
        var slot2 = slots[j];
        var fromTime2 = moment(`1970-01-01T${slot2.fromTime}:00Z`);
        var toTime2 = moment(`1970-01-01T${slot2.toTime}:00Z`);

        if (
          (fromTime2 >= fromTime1 && fromTime2 < toTime1) ||
          (fromTime1 >= fromTime2 && fromTime1 < toTime2)
        ) {
          throw new BadRequestException(
            this.i18n.t(`errors.INTERSECTED_SLOTS`, {
              lang: I18nContext.current().lang,
            }),
          );
        }
      }
    }
  }
  private groupSlotsByWeekday(slotsArray: SlotDetailsDto[]) {
    return slotsArray.reduce((acc, obj) => {
      const groupKey = obj['weekDayNumber'];
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(obj);
      return acc;
    }, {});
  }
}
