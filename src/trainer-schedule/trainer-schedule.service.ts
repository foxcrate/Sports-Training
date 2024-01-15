import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { TrainerScheduleModel } from './trainer-schedule.model';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { TrainerProfileModel } from 'src/trainer-profile/trainer-profile.model';
import { ScheduleCreateDto } from './dtos/create.dto';
import { SlotDetailsDto } from './dtos/slot-details.dto';
import * as moment from 'moment-timezone';
import { ScheduleSlotsDTO } from './dtos/schedule-slots';
import { RateSessionDto } from './dtos/rate-session.dto';

@Injectable()
export class TrainerScheduleService {
  constructor(
    private scheduleModel: TrainerScheduleModel,
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

  async getTrainerFields(trainerProfileId: number) {
    return await this.trainerProfileModel.getTrainerFields(trainerProfileId);
  }

  async getTrainerFieldDaysForThisWeek(trainerProfileId: number, fieldId: number) {
    let trainerFieldSlots: any = await this.scheduleModel.getTrainerFieldSlots(
      trainerProfileId,
      fieldId,
    );

    let weekDays = [];

    let endOfWeek = moment().endOf('week');

    let toDay = moment();

    // loop to get week days
    while (toDay < endOfWeek) {
      let newDay = moment(toDay).format('YYYY-MM-DD');

      if (this.checkNotAvailableDays(newDay, trainerFieldSlots?.notAvailableDays)) {
        if (this.checkWeekDayAvailability(newDay, trainerFieldSlots?.scheduleSlots)) {
          weekDays.push(newDay);
        }
      }

      toDay.add(1, 'days');
    }

    return weekDays;
  }

  async getTrainerDayFieldSlots(
    trainerProfileId: number,
    fieldId: number,
    dayDate: string,
  ) {
    let trainerFieldSlots: any = await this.scheduleModel.getTrainerFieldSlots(
      trainerProfileId,
      fieldId,
    );

    dayDate = moment(dayDate).format('YYYY-MM-DD');

    let returnSlots = [];

    if (this.checkNotAvailableDays(dayDate, trainerFieldSlots?.notAvailableDays)) {
      let availableSlotsForDay = this.getDaySlots(
        dayDate,
        trainerFieldSlots?.scheduleSlots,
      );
      for (let i = 0; i < availableSlotsForDay.length; i++) {
        //check for booked
        if (!(await this.checkBookedSlot(availableSlotsForDay[i].id, dayDate))) {
          returnSlots.push({
            slotId: availableSlotsForDay[i].id,
            fromTime: moment(`${dayDate}T${availableSlotsForDay[i].fromTime}`).format(
              'hh:mm A',
            ),
            toTime: moment(`${dayDate}T${availableSlotsForDay[i].toTime}`).format(
              'hh:mm A',
            ),
          });
        }
      }
      return returnSlots;
    } else {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, { lang: I18nContext.current().lang }),
      );
    }
  }

  async bookTrainerSession(
    userId,
    trainerProfileId: number,
    dayDate: string,
    slotId: number,
  ) {
    await this.validateBookingTrainerSession(trainerProfileId, dayDate, slotId);
    let trainerBookedSession = await this.scheduleModel.createTrainerBookedSession(
      userId,
      dayDate,
      trainerProfileId,
      slotId,
    );

    await this.scheduleModel.createNewSessionRequest(trainerBookedSession.id);
    // send firebase notification

    let trainerBookedSessionCard = await this.scheduleModel.getTrainerBookedSessionCard(
      trainerBookedSession.id,
    );

    let formatedDayDate = moment(trainerBookedSessionCard.date).format('YYYY-MM-DD');

    return {
      firstName: trainerBookedSessionCard.firstName,
      lastName: trainerBookedSessionCard.lastName,
      profileImage: trainerBookedSessionCard.profileImage,
      date: formatedDayDate,
      fromTime: moment(`${formatedDayDate}T${trainerBookedSessionCard.fromTime}`).format(
        'hh:mm A',
      ),
      toTime: moment(`${formatedDayDate}T${trainerBookedSessionCard.toTime}`).format(
        'hh:mm A',
      ),
      cost: trainerBookedSessionCard.cost,
      sports: trainerBookedSessionCard.sports,
    };
  }

  async trainerRateSession(userId: number, reqBody: RateSessionDto) {
    // throw an error if trainerProfile don't exist
    let theTrainerProfile = await this.trainerProfileModel.getByUserId(userId);

    // throw error if session don't exist
    let theSession = await this.scheduleModel.getBookedSessionById(reqBody.sessionId);

    await this.validateTrainerRatingSession(
      theTrainerProfile.id,
      theSession.trainerProfileId,
    );
    await this.scheduleModel.saveTrainerSessionRating(
      theTrainerProfile.userId,
      theSession.id,
      reqBody.ratingNumber,
      reqBody.feedback,
    );
    return true;
  }

  // // private // //

  async validateTrainerRatingSession(
    theTrainerProfileId: number,
    sessionTrainerProfileId: number,
  ) {
    //check if this session is done by this trainer
    if (sessionTrainerProfileId != theTrainerProfileId) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_TRAINER_SESSION_MIX`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  private async validateBookingTrainerSession(
    trainerProfileId: number,
    dayDate: string,
    slotId: number,
  ) {
    let theSlot = await this.scheduleModel.getSlotById(slotId);
    let theSchedule = await this.scheduleModel.getByID(null, theSlot.scheduleId);
    let trainerFieldSlots: any = await this.scheduleModel.getTrainerFieldSlots(
      trainerProfileId,
      theSlot.fieldId,
    );

    // check not available days
    if (!this.checkNotAvailableDays(dayDate, trainerFieldSlots?.notAvailableDays)) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, { lang: I18nContext.current().lang }),
      );
    }

    // check schedule slot
    if (
      !this.checkWeekDayAvailabilityForOneScheduleSlot(dayDate, theSchedule, theSlot.id)
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.WEEK_DAY_NOT_AVAILABLE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // check booked slots
    if (await this.checkBookedSlot(slotId, dayDate)) {
      throw new BadRequestException(
        this.i18n.t(`errors.BOOKED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return true;
  }

  private async checkBookedSlot(slotId: number, dayDate: string): Promise<boolean> {
    let bookedSlot = await this.scheduleModel.getBookedSessionBySlotId(slotId, dayDate);

    if (bookedSlot) {
      return true;
    } else {
      return false;
    }
  }

  private checkNotAvailableDays(dayDate: string, notAvailableDays: any[]): boolean {
    // check day is not in non available days
    if (!notAvailableDays?.includes(dayDate)) {
      return true;
    }
    return false;
  }

  private checkWeekDayAvailability(
    dayDateString: string,
    scheduleSlots: ScheduleSlotsDTO[],
  ): boolean {
    // check the month and week day');

    let dayDate = moment(dayDateString);
    let dateMonth = dayDate.month() + 1;
    let dateWeekDay = dayDate.weekday();

    for (let i = 0; i < scheduleSlots?.length; i++) {
      let monthsNumbers = scheduleSlots[i].months.map((i) => {
        return i.number;
      });

      // console.log(monthsNumbers);

      let weekDaysNumbers = scheduleSlots[i].slots.map((i) => {
        return i.weekDayNumber;
      });

      if (monthsNumbers.includes(dateMonth)) {
        if (weekDaysNumbers.includes(dateWeekDay)) {
          // console.log('true');
          // console.log(scheduleSlots[i]);

          return true;
        }
      }
    }

    return false;
  }

  private checkWeekDayAvailabilityForOneScheduleSlot(
    dayDateString: string,
    scheduleSlot: ScheduleSlotsDetailsDTO,
    slotId: number,
  ): boolean {
    // check the month and week day
    let dayDate = moment(dayDateString);
    let dateMonth = dayDate.month() + 1;
    let dateWeekDay = dayDate.weekday();

    let monthsNumbers = scheduleSlot.scheduleMonths.map((i) => {
      return i;
    });

    let theSlot = scheduleSlot.ScheduleSlots.find((i) => i.id == slotId);

    if (!theSlot) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_EXISTED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    if (monthsNumbers.includes(dateMonth)) {
      if (theSlot.weekDayNumber == dateWeekDay) {
        return true;
      }
    }

    return false;
  }

  private getDaySlots(
    dayDateString: string,
    scheduleSlots: ScheduleSlotsDTO[],
  ): SlotDetailsDto[] {
    let daySlots: any = [];
    let dayDateWeekDay = moment(dayDateString).weekday();
    let dayDateMonth = moment(dayDateString).month() + 1;

    for (let i = 0; i < scheduleSlots?.length; i++) {
      let slotMonthsNumbers = scheduleSlots[i].months.map((i) => {
        return i.number;
      });

      if (slotMonthsNumbers.includes(dayDateMonth)) {
        for (let j = 0; j < scheduleSlots[i].slots.length; j++) {
          let slotWeekDay = scheduleSlots[i].slots[j].weekDayNumber;
          if (dayDateWeekDay == slotWeekDay) {
            daySlots.push(scheduleSlots[i].slots[j]);
          }
        }
        // return scheduleSlots[i].slots;
        break;
      }
    }

    return daySlots;
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
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
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
      if (allTrainerSchedulesMonths?.includes(reqBody.months[i])) {
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
      if (allTrainerSchedulesMonthsExceptOne?.includes(reqBody.months[i])) {
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
