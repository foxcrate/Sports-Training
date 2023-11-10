import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { FieldModel } from './field.model';
import { FieldCreateDto } from './dtos/create.dto';
import { FieldUpdateDto } from './dtos/update.dto';
import { FieldAcceptanceStatusDto } from './dtos/field-acceptance-status.dto';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { FieldReturnDto } from './dtos/return.dto';
import { FreeSlots } from './dtos/free-slots.dto';

@Injectable()
export class AdminFieldService {
  constructor(
    private fieldModel: FieldModel,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(): Promise<FieldBookingDetailsDTO[]> {
    return await this.fieldModel.allFields();
  }

  async getOne(id: number): Promise<FieldBookingDetailsDTO> {
    return await this.fieldModel.getByID(id);
  }

  async create(reqBody: FieldCreateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldModel.getByName(reqBody.name);

    if (repeatedField) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }

    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldModel.create(reqBody);
  }

  async update(id: number, reqBody: FieldUpdateDto): Promise<FieldReturnDto> {
    // check for repeated name;
    let repeatedField = await this.fieldModel.getByName(reqBody.name);

    if (repeatedField && repeatedField.id == id) {
      throw new BadRequestException(
        this.i18n.t(`errors.REPEATED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    reqBody.availableWeekDays = JSON.stringify(reqBody.availableWeekDays);

    return await this.fieldModel.update(id, reqBody);
  }

  async delete(id: number): Promise<FieldBookingDetailsDTO> {
    let deletedField = await this.fieldModel.getByID(id);
    this.fieldModel.deleteByID(id);
    return deletedField;
  }

  async getPendingFields(): Promise<FieldBookingDetailsDTO[]> {
    let pendingField = await this.fieldModel.selectPendingFields();
    return pendingField;
  }

  async changeFieldAcceptanceStatue(
    fieldId: number,
    newStatus: FieldAcceptanceStatusDto,
  ): Promise<Boolean> {
    let theField = await this.fieldModel.getByID(fieldId);
    if (theField.acceptanceStatus != FieldAcceptanceStatusDto.Pending) {
      throw new BadRequestException(
        this.i18n.t(`errors.FIELD_NOT_PENDING`, { lang: I18nContext.current().lang }),
      );
    }
    return await this.fieldModel.setFieldAcceptanceStatue(fieldId, newStatus);
  }

  async addNotAvailableDays(fieldId: number, datesArray: string[]) {
    return await this.fieldModel.insertNotAvailableDays(fieldId, datesArray);
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
