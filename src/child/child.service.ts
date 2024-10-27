import { Injectable, NotFoundException } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UserRepository } from '../user/user.repository';
import { ADDITIONAL_SELECT_COLUMNS, FIND_BY } from 'src/user/user-enums';

@Injectable()
export class ChildService {
  constructor(
    private globalService: GlobalService,
    private userRepository: UserRepository,
    private readonly i18n: I18nService,
  ) {}

  async activateAccount(reqBody) {
    let child = await this.userRepository.findBy(
      FIND_BY.MOBILE_NUMBER,
      reqBody.mobileNumber,
      [
        ADDITIONAL_SELECT_COLUMNS.PASSWORD,
        ADDITIONAL_SELECT_COLUMNS.IS_ACTIVATED,
        ADDITIONAL_SELECT_COLUMNS.IS_PHONE_VERIFIED,
        ADDITIONAL_SELECT_COLUMNS.USER_TYPE,
      ],
    );

    if (child.password !== null || child.isActivated) {
      throw new NotFoundException(
        this.i18n.t(`errors.ACCOUNT_ALREADY_ACTIVATED`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    let hashedPassword = await this.globalService.hashPassword(reqBody.password);

    Promise.all([
      await this.userRepository.updateById(child.id, { password: hashedPassword }),
      await this.userRepository.activateAccount(child.id),
    ]);

    let updatedChild = await this.userRepository.findBy(FIND_BY.ID, child.id);

    return updatedChild;
  }
}
