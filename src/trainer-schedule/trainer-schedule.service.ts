import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { TrainerScheduleRepository } from './trainer-schedule.repository';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { TrainerProfileRepository } from 'src/trainer-profile/trainer-profile.repository';
import { ScheduleCreateDto } from './dtos/create.dto';
import { SlotDetailsDto } from './dtos/slot-details.dto';
import moment from 'moment-timezone';
import { ScheduleSlotsDTO } from './dtos/schedule-slots';
import { SessionRepository } from 'src/session/session.repository';
import { UserSlotState } from './dtos/user-slot-state.dto';
import { SessionCardDTO } from 'src/session/dtos/session-card.dto';
import { SimplifiedFieldReturn } from 'src/field/dtos/field-simplified-return.dto';
import {
  NOTIFICATION_ABOUT,
  NOTIFICATION_CONTENT,
  NOTIFICATION_SENT_TO,
  NOTIFICATION_TYPE,
  SESSIONS_STATUSES_ENUM,
} from 'src/global/enums';
import { NotificationRepository } from 'src/notification/notification.repository';
import { FieldRepository } from 'src/field/field.repository';
import { PackageReturnDto } from 'src/package/dtos/package-return.dto';
import { UserService } from 'src/user/user.service';
import { PlayerProfileRepository } from 'src/player-profile/player-profile.repository';

@Injectable()
export class TrainerScheduleService {
  constructor(
    private trainerScheduleRepository: TrainerScheduleRepository,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
    private trainerProfileRepository: TrainerProfileRepository,
    private sessionRepository: SessionRepository,
    private userService: UserService,
    private playerProfileRepository: PlayerProfileRepository,
    private fieldRepository: FieldRepository,
    private notificationRepository: NotificationRepository,
  ) {}

  async getAll(userId: number): Promise<ScheduleSlotsDetailsDTO[]> {
    //get user traienr profile
    let trainerProfile = await this.trainerProfileRepository.getByUserId(userId);

    return await this.trainerScheduleRepository.getAll(trainerProfile.id);
  }

  async getOne(
    timezone: string,
    userId: number,
    scheduleId: number,
  ): Promise<ScheduleSlotsDetailsDTO> {
    return await this.authorizeResource(timezone, userId, scheduleId);
  }

  async create(
    timezone,
    userId: number,
    reqBody: ScheduleCreateDto,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let trainerProfile = await this.trainerProfileRepository.getByUserId(userId);

    ///////// Temproray, Trainer has one schedule /////////
    let trainerSchedules = await this.getAll(trainerProfile.userId);
    if (trainerSchedules.length == 1) {
      throw new BadRequestException(
        this.i18n.t(`errors.TRAINER_ALREADY_HAS_SCHEDULE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    //////////
    reqBody.slots = this.slotsTimeTo24(reqBody.slots);

    await this.validateCreateScheduleMonths(trainerProfile.id, reqBody);
    await this.groupingAndValidatingScheduleSlots(reqBody.slots);
    return await this.trainerScheduleRepository.create(
      timezone,
      trainerProfile.id,
      reqBody,
    );
  }

  async delete(
    timezone,
    userId: number,
    scheduleId: number,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let theSchedule = await this.authorizeResource(timezone, userId, scheduleId);
    return await this.trainerScheduleRepository.deleteByID(timezone, theSchedule.id);
  }

  async update(
    timezone: string,
    userId: number,
    scheduleId: number,
    reqBody: ScheduleCreateDto,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let schedule = await this.authorizeResource(timezone, userId, scheduleId);
    await this.validateUpdateScheduleMonths(
      schedule.id,
      schedule.trainerProfileId,
      reqBody,
    );
    await this.groupingAndValidatingScheduleSlots(reqBody.slots);
    return await this.trainerScheduleRepository.update(timezone, schedule.id, reqBody);
  }

  async getTrainerFields(trainerProfileId: number): Promise<SimplifiedFieldReturn[]> {
    return await this.trainerProfileRepository.getTrainerFields(trainerProfileId);
  }

  async getTrainerFieldDaysForThisWeek(
    trainerProfileId: number,
    fieldId: number,
  ): Promise<string[]> {
    let trainerFieldSlots = await this.trainerScheduleRepository.getTrainerFieldSlots(
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
    userId: number,
    trainerProfileId: number,
    fieldId: number,
    dayDate: string,
  ): Promise<UserSlotState[]> {
    let trainerFieldSlots = await this.trainerScheduleRepository.getTrainerFieldSlots(
      trainerProfileId,
      fieldId,
    );

    dayDate = moment(dayDate).format('YYYY-MM-DD');

    let playerBookedTimes = await this.trainerScheduleRepository.getUserBookedTimes(
      userId,
      dayDate,
    );

    let trainerFreeSlots = [];

    // check if day is registered as not available by trainer
    if (!this.checkNotAvailableDays(dayDate, trainerFieldSlots?.notAvailableDays)) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, { lang: I18nContext.current().lang }),
      );
    }

    let availableSlotsForDay = this.getDaySlots(
      dayDate,
      trainerFieldSlots?.scheduleSlots,
    );
    for (let i = 0; i < availableSlotsForDay.length; i++) {
      //check for trainer booked slots
      if (
        !(await this.checkBookedSlot(
          availableSlotsForDay[i].id,
          dayDate,
          null,
          SESSIONS_STATUSES_ENUM.ACTIVE,
        ))
      ) {
        trainerFreeSlots.push({
          slotId: availableSlotsForDay[i].id,
          fromTime: availableSlotsForDay[i].fromTime,
          toTime: availableSlotsForDay[i].toTime,
          status: true,
        });
      }
    }

    let slotTime24 = this.validateSlotStateRelativeToPlayerTime(
      trainerFreeSlots,
      playerBookedTimes,
    );

    //turn slot time to time12
    return this.slotsTimeTo12(slotTime24);
  }

  async bookTrainerSession(
    userId,
    trainerProfileId: number,
    dayDate: string,
    slotId: number,
  ): Promise<SessionCardDTO> {
    await this.validateBookingTrainerSession(userId, trainerProfileId, dayDate, slotId);

    let trainerBookedSession = await this.sessionRepository.createTrainerBookedSession(
      userId,
      dayDate,
      trainerProfileId,
      slotId,
    );

    let theTrainerProfile = await this.trainerProfileRepository.getByID(trainerProfileId);

    await this.sessionRepository.createNewTrainerSessionRequest(trainerBookedSession.id);

    // create notification
    await this.notificationRepository.createOne(
      theTrainerProfile.userId,
      trainerBookedSession.id,
      NOTIFICATION_SENT_TO.TRAINER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.REQUEST,
      NOTIFICATION_CONTENT.USER_REQUESTED_SESSION,
    );

    let trainerBookedSessionCard =
      await this.sessionRepository.getTrainerBookedSessionCard(trainerBookedSession.id);

    let formatedDayDate = moment(trainerBookedSessionCard.date).format('YYYY-MM-DD');

    trainerBookedSessionCard.fromTime = moment(
      `${formatedDayDate}T${trainerBookedSessionCard.fromTime}`,
    ).format('hh:mm A');
    trainerBookedSessionCard.toTime = moment(
      `${formatedDayDate}T${trainerBookedSessionCard.toTime}`,
    ).format('hh:mm A');

    return trainerBookedSessionCard;
  }

  async bookTrainerSessionForChild(
    userId,
    childId,
    trainerProfileId: number,
    dayDate: string,
    slotId: number,
  ): Promise<SessionCardDTO> {
    //validate parent child relationship
    await this.userService.validateParentChildRelation(userId, childId);

    //validate child has a profile
    let childProfile = await this.playerProfileRepository.getOneByUserId(childId);

    if (!childProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.CHILD_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    await this.validateBookingTrainerSession(childId, trainerProfileId, dayDate, slotId);

    let trainerBookedSession = await this.sessionRepository.createTrainerBookedSession(
      childId,
      dayDate,
      trainerProfileId,
      slotId,
    );

    let theTrainerProfile = await this.trainerProfileRepository.getByID(trainerProfileId);

    await this.sessionRepository.createNewTrainerSessionRequest(trainerBookedSession.id);

    // create notification
    await this.notificationRepository.createOne(
      theTrainerProfile.userId,
      trainerBookedSession.id,
      NOTIFICATION_SENT_TO.TRAINER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.REQUEST,
      NOTIFICATION_CONTENT.USER_REQUESTED_SESSION,
    );

    let trainerBookedSessionCard =
      await this.sessionRepository.getTrainerBookedSessionCard(trainerBookedSession.id);

    trainerBookedSessionCard.date = moment(trainerBookedSessionCard.date).format(
      'YYYY-MM-DD',
    );

    let formatedDayDate = trainerBookedSessionCard.date;

    trainerBookedSessionCard.fromTime = moment(
      `${formatedDayDate}T${trainerBookedSessionCard.fromTime}`,
    ).format('hh:mm A');
    trainerBookedSessionCard.toTime = moment(
      `${formatedDayDate}T${trainerBookedSessionCard.toTime}`,
    ).format('hh:mm A');

    return trainerBookedSessionCard;
  }

  async savePackageSessions(userId: number, thePackage: PackageReturnDto) {
    // create trainer package slots
    for (let index = 0; index < thePackage.sessionsDateTime.length; index++) {
      let createSlot = await this.trainerScheduleRepository.createPackageSlot(
        thePackage.id,
        thePackage.name,
        thePackage.price,
        thePackage.fieldId,
        thePackage.sessionsDateTime[index],
      );

      // create package sessions
      await this.sessionRepository.createPackageSession(
        userId,
        thePackage.sessionsDateTime[index].date,
        thePackage.trainerProfileId,
        createSlot.id,
        thePackage.id,
      );
    }
  }

  // // private // //

  private async validateBookingTrainerSession(
    userId: number,
    trainerProfileId: number,
    dayDate: string,
    slotId: number,
  ): Promise<boolean> {
    let theSlot = await this.trainerScheduleRepository.getSlotById(slotId);
    let theTrainerProfile = await this.trainerProfileRepository.getByID(trainerProfileId);
    let theSchedule = await this.trainerScheduleRepository.getByID(
      null,
      theSlot.scheduleId,
    );
    let trainerFieldSlots = await this.trainerScheduleRepository.getTrainerFieldSlots(
      trainerProfileId,
      theSlot.fieldId,
    );

    // validate its an upcoming date
    let dateNow = moment(moment().format('YYYY-MM-DD'));
    let bookingDate = moment(dayDate);

    if (dateNow > bookingDate) {
      throw new BadRequestException(
        this.i18n.t(`errors.PASSED_DATE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // check different player and trainer
    if (userId === theTrainerProfile.userId) {
      throw new BadRequestException(
        this.i18n.t(`errors.SAME_PLAYER_TRAINER_PROFILE_OWNER`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // check not available days
    if (!this.checkNotAvailableDays(dayDate, trainerFieldSlots?.notAvailableDays)) {
      throw new BadRequestException(
        this.i18n.t(`errors.DAY_NOT_AVAILABLE`, { lang: I18nContext.current().lang }),
      );
    }

    // validate trainer's hoursPriorToBooking
    let timeNow = moment();
    let bookingTime = moment(`${dayDate}T${theSlot.fromTime}`);

    var durationInHours = moment.duration(bookingTime.diff(timeNow)).asHours();

    if (durationInHours < theTrainerProfile.hoursPriorToBooking) {
      throw new BadRequestException(
        this.i18n.t(`errors.LATE_BOOKING_TIME`, { lang: I18nContext.current().lang }),
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
    if (await this.checkBookedSlot(slotId, dayDate, userId)) {
      throw new BadRequestException(
        this.i18n.t(`errors.BOOKED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    //check intersection of time between player booked session and new one
    let playerBookedTimes = await this.trainerScheduleRepository.getUserBookedTimes(
      userId,
      dayDate,
    );

    this.validateOneSlotStateRelativeToPlayerTime(theSlot, playerBookedTimes);

    return true;
  }

  async checkBookedSlot(
    slotId: number,
    dayDate: string,
    userId: number = null,
    status: string = null,
  ): Promise<boolean> {
    let bookedSlot = await this.sessionRepository.getBookedSessionBySlotId(
      slotId,
      dayDate,
      userId,
      status,
    );

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

      let weekDaysNumbers = scheduleSlots[i].slots.map((i) => {
        return i.weekDayNumber;
      });

      if (monthsNumbers.includes(dateMonth)) {
        if (weekDaysNumbers.includes(dateWeekDay)) {
          return true;
        }
      }
    }

    return false;
  }

  private validateSlotStateRelativeToPlayerTime(
    trainerFreeSlots: UserSlotState[],
    playerBookedSlots: UserSlotState[],
  ): UserSlotState[] {
    for (let i = 0; i < trainerFreeSlots.length; i++) {
      var trainerSlot = trainerFreeSlots[i];
      var fromTime1 = moment(`1970-01-01T${trainerSlot.fromTime}`);

      var toTime1 = moment(`1970-01-01T${trainerSlot.toTime}`);

      for (let j = 0; j < playerBookedSlots.length; j++) {
        var playerSlot = playerBookedSlots[j];
        var fromTime2 = moment(`1970-01-01T${playerSlot.fromTime}`);
        var toTime2 = moment(`1970-01-01T${playerSlot.toTime}`);
        if (
          (fromTime2 >= fromTime1 && fromTime2 < toTime1) ||
          (fromTime1 >= fromTime2 && fromTime1 < toTime2)
        ) {
          trainerFreeSlots[i].status = false;
        }
      }
    }
    return trainerFreeSlots;
  }

  private validateOneSlotStateRelativeToPlayerTime(
    newSLot: SlotDetailsDto,
    playerBookedSlots: UserSlotState[],
  ): boolean {
    var fromTime1 = moment(`1970-01-01T${newSLot.fromTime}`);

    var toTime1 = moment(`1970-01-01T${newSLot.toTime}`);

    for (let j = 0; j < playerBookedSlots.length; j++) {
      var playerSlot = playerBookedSlots[j];
      var fromTime2 = moment(`1970-01-01T${playerSlot.fromTime}`);
      var toTime2 = moment(`1970-01-01T${playerSlot.toTime}`);
      if (
        (fromTime2 >= fromTime1 && fromTime2 < toTime1) ||
        (fromTime1 >= fromTime2 && fromTime1 < toTime2)
      ) {
        throw new BadRequestException(
          this.i18n.t(`errors.BOOKED_TIME`, { lang: I18nContext.current().lang }),
        );
      }
    }

    return true;
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
    let dayDateMonth = moment(dayDateString).month() + 1;
    let dayDateWeekDay = moment(dayDateString).weekday();

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

  private slotsTimeTo24(slotsArray: SlotDetailsDto[]): SlotDetailsDto[] {
    return slotsArray.map((slot) => {
      slot.fromTime = this.globalService.timeTo24(slot.fromTime);
      slot.toTime = this.globalService.timeTo24(slot.toTime);
      return slot;
    });
  }

  private slotsTimeTo12(slotsArray: UserSlotState[]): UserSlotState[] {
    return slotsArray.map((slot) => {
      slot.fromTime = moment(`1970-01-01T${slot.fromTime}`).format('hh:mm A');
      slot.toTime = moment(`1970-01-01T${slot.toTime}`).format('hh:mm A');
      return slot;
    });
  }

  async authorizeResource(
    timezone,
    userId: number,
    scheduleId: number,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let schedule = await this.trainerScheduleRepository.getByID(timezone, scheduleId);

    let schedulesIds = await this.trainerProfileRepository.getSchedulesIds(userId);

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
  ): Promise<boolean> {
    //get all trainer schedule months
    let allTrainerSchedulesMonths =
      await this.trainerScheduleRepository.allTrainerSchedulesMonths(trainerProfileId);

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
  ): Promise<boolean> {
    //get all trainer schedule months except the desired update schedule
    let allTrainerSchedulesMonthsExceptOne =
      await this.trainerScheduleRepository.allTrainerSchedulesMonthsExceptOne(
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

  private async groupingAndValidatingScheduleSlots(slots: SlotDetailsDto[]) {
    // validate fields existence
    let slotsFieldsIds = slots.map((slot) => {
      return slot.fieldId;
    });
    let uniqueSlotsFieldsIds = [...new Set(slotsFieldsIds)];

    let foundedFields = await this.fieldRepository.getManyFields(uniqueSlotsFieldsIds);

    if (foundedFields.length !== uniqueSlotsFieldsIds.length) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_EXISTED_FIELD`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

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
    // group slots by weekday number
    // returnValue:
    //{
    //     '1':slotDetails[],
    //     '5':slotDetails[]
    // }
    return slotsArray.reduce((acc, obj) => {
      const groupKey = obj['weekDayNumber'];
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(obj);
      return acc;
    }, {});
  }
}
