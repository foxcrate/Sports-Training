import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { FieldRepository } from './field.repository';
import { FieldCreateDto } from './dtos/create.dto';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldAcceptanceStatusDto } from './dtos/field-acceptance-status.dto';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { FieldReturnDto } from './dtos/return.dto';

@Injectable()
export class AdminFieldService {
  constructor(
    private fieldRepository: FieldRepository,
    private readonly i18n: I18nService,
  ) {}

  async getAll(): Promise<FieldBookingDetailsDTO[]> {
    return await this.fieldRepository.allFields();
  }

  async getOne(id: number): Promise<FieldBookingDetailsDTO> {
    return await this.fieldRepository.getByID(id);
  }

  async create(reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldRepository.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }

    // reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldRepository.create(reqBody);
  }

  async update(id: number, reqBody: FieldUpdateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldRepository.getByName(reqBody.name);

    if (repeatedField && repeatedField.id == id) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldRepository.update(id, reqBody);
  }

  async delete(id: number): Promise<FieldBookingDetailsDTO> {
    let deletedField = await this.fieldRepository.getByID(id);

    Promise.all([
      await this.fieldRepository.deleteSlots(id),
      await this.fieldRepository.deleteRates(id),
      await this.fieldRepository.deleteNotAvailableDays(id),
      await this.fieldRepository.deleteBookedHours(id),
      await this.fieldRepository.deleteTrainerProfileFields(id),
    ]);

    await this.fieldRepository.deleteByID(id);
    return deletedField;
  }

  async getPendingFields(): Promise<FieldBookingDetailsDTO[]> {
    let pendingField = await this.fieldRepository.selectPendingFields();
    return pendingField;
  }

  async changeFieldAcceptanceStatue(
    fieldId: number,
    newStatus: FieldAcceptanceStatusDto,
  ): Promise<boolean> {
    let theField = await this.fieldRepository.getByID(fieldId);
    if (theField.acceptanceStatus != FieldAcceptanceStatusDto.Pending) {
      throw new BadRequestException(
        this.i18n.t(`errors.FIELD_NOT_PENDING`, { lang: I18nContext.current().lang }),
      );
    }
    return await this.fieldRepository.setFieldAcceptanceStatue(fieldId, newStatus);
  }

  async addNotAvailableDays(fieldId: number, datesArray: string[]) {
    let theField = await this.fieldRepository.getByID(fieldId);
    return await this.fieldRepository.insertNotAvailableDays(fieldId, datesArray);
  }
}

// new Date(dayDate).toLocaleDateString()
// let fieldWorkingFromHour = new Date(
//   `2020-10-10T${theField[0].availableDayHours.from}`,
// ).toTimeString();

// let dateNow = new Date();
// dateNow.setHours(dateNow.getHours() + 1);
// TIME_FORMAT(f.availableDayHours->>"$.to", '%H:%i') AS toTime,
// ${fromTimeToCheck} BETWEEN fbh.fromDateTime AND fbh.toDateTime
// TIME_FORMAT(availableDayHours->>"$.to", '%H:%i:%s') AS testTime,
