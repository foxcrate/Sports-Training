import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NativeChildDto } from './dtos/native.dto';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ReturnChildDto } from './dtos/return.dto';

@Injectable()
export class ChildService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}

  async findByMobile(mobileNumber: string): Promise<NativeChildDto> {
    let foundedAccount = await this.prisma.$queryRaw`
    SELECT *
    FROM Child
    WHERE mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (!foundedAccount[0] || foundedAccount[0].password == null) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }
    return foundedAccount[0];
  }

  async findRepeated(email, mobileNumber): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedChild = await this.prisma.$queryRaw`
    SELECT *
    FROM Child
    WHERE email = ${email} OR mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (repeatedChild[0]) {
      if (repeatedChild[0].email == email) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_EMAIL`, { lang: I18nContext.current().lang }),
        );
      }
      if (repeatedChild[0].mobileNumber == mobileNumber) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_MOBILE_NUMBER`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }

  async getNativeByMobileNumber(mobileNumber: string) {
    //Chick existed email or phone number
    let foundedChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
      `;

    if (!foundedChild[0]) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }

    return foundedChild[0];
  }

  async activateAccount(reqBody) {
    let child = await this.getNativeByMobileNumber(reqBody.mobileNumber);

    if (child.password !== null) {
      throw new NotFoundException(
        this.i18n.t(`errors.ACCOUNT_ALREADY_ACTIVATED`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    let hashedPassword = await this.globalService.hashPassword(reqBody.password);
    await this.prisma.$queryRaw`
      UPDATE Child
      SET password = ${hashedPassword}
      WHERE id = ${child.id}
      `;

    let updatedChild = await this.prisma.$queryRaw`
      SELECT
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday,
        userId
      FROM Child
      WHERE id = ${child.id}
      LIMIT 1
    `;

    return updatedChild[0];
  }

  async getChildById(childId): Promise<ReturnChildDto> {
    let theChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE id = ${childId}
      LIMIT 1
    `;

    if (!theChild[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    return theChild[0];
  }

  async createByUser(reqBody, userId) {
    await this.prisma.$queryRaw`
    INSERT INTO Child
      (firstName,
      lastName,
      profileImage,
      email,
      mobileNumber,
      gender,
      birthday,
      userId,
      updatedAt)
      VALUES
    (${reqBody.firstName},
    ${reqBody.lastName},
    ${reqBody.profileImage},
    ${reqBody.email},
    ${reqBody.mobileNumber},
    ${reqBody.gender},
    ${reqBody.birthday},
    ${userId},
    ${this.globalService.getLocalDateTime(new Date())})`;
  }

  async getByMobileNumber(mobileNumber): Promise<ReturnChildDto> {
    let theChild = await this.prisma.$queryRaw`
      SELECT
        id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday,
        userId
      FROM Child
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
    `;
    return theChild[0];
  }

  async updateById(childId, reqBody) {
    //update
    await this.prisma.$queryRaw`
      UPDATE Child
      SET
      firstName = ${reqBody.firstName},
      lastName = ${reqBody.lastName},
      profileImage = ${reqBody.profileImage},
      gender = ${reqBody.gender},
      birthday = ${reqBody.birthday},
      updatedAt = ${this.globalService.getLocalDateTime(new Date())}
      WHERE
      id = ${childId};
    `;
  }

  async deleteById(childId) {
    await this.prisma.$queryRaw`
    DELETE FROM
    Child
    WHERE
    id = ${childId};`;
  }
}
