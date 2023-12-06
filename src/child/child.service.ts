import { Injectable, NotFoundException } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UserModel } from '../user/user.model';

@Injectable()
export class ChildService {
  constructor(
    private globalService: GlobalService,
    private userModel: UserModel,
    private readonly i18n: I18nService,
  ) {}

  async activateAccount(reqBody) {
    let child = await this.userModel.getNativeByMobileNumber(reqBody.mobileNumber);

    if (child.password !== null || child.isActivated) {
      throw new NotFoundException(
        this.i18n.t(`errors.ACCOUNT_ALREADY_ACTIVATED`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    let hashedPassword = await this.globalService.hashPassword(reqBody.password);

    Promise.all([
      await this.userModel.updatePassword(child.id, hashedPassword),
      await this.userModel.activateAccount(child.id),
    ]);
    // await this.userModel.updatePassword(child.id, hashedPassword);
    // await this.userModel.activateAccount(child.id);

    let updatedChild = await this.userModel.getById(child.id);

    return updatedChild;
  }
}
