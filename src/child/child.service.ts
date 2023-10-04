import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupChildDto } from 'src/child/dtos/signup.dto';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { ReturnChildSerializer } from './serializers/return-child.serializer';
import { PasswordUtility } from '../utils/password.util';
import { ReturnChildDto } from './dtos/return.dto';
import { NativeChildDto } from './dtos/native.dto';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class ChildService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  async findByMobile(mobileNumber: string): Promise<NativeChildDto> {
    let foundedAccount = await this.prisma.$queryRaw`
    SELECT *
    FROM Child
    WHERE mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (!foundedAccount[0] || foundedAccount[0].password == null) {
      // throw new NewBadRequestException('WRONG_CREDENTIALS');
      throw new UnauthorizedException(
        this.globalService.getError('en', 'WRONG_CREDENTIALS'),
      );
    }
    return foundedAccount[0];
  }

  async findRepeated(email, mobileNumber): Promise<Boolean> {
    //Chick existed email or phone number
    // throw new HttpException('toto error', HttpStatus.INTERNAL_SERVER_ERROR);
    let repeatedChild = await this.prisma.$queryRaw`
    SELECT *
    FROM Child
    WHERE email = ${email} OR mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (repeatedChild[0]) {
      if (repeatedChild[0].email == email) {
        // throw new NewBadRequestException('REPEATED_EMAIL');
        throw new BadRequestException(
          this.globalService.getError('en', 'REPEATED_EMAIL'),
        );
      }
      if (repeatedChild[0].mobileNumber == mobileNumber) {
        // throw new NewBadRequestException('REPEATED_MOBILE_NUMBER');
        throw new BadRequestException(
          this.globalService.getError('en', 'REPEATED_MOBILE_NUMBER'),
        );
      }
    }
    return false;
  }

  async findByMobileNumber(mobileNumber: string) {
    //Chick existed email or phone number
    let foundedChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
      `;

    if (!foundedChild[0]) {
      // throw new NewBadRequestException('WRONG_CREDENTIALS');
      throw new UnauthorizedException(
        this.globalService.getError('en', 'WRONG_CREDENTIALS'),
      );
    }

    return foundedChild[0];
  }

  async activateAccount(reqBody) {
    let child = await this.findByMobileNumber(reqBody.mobileNumber);

    if (child.password !== null) {
      // throw new NewBadRequestException('ACCOUNT_ALREADY_ACTIVATED');
      throw new NotFoundException(
        this.globalService.getError('en', 'ACCOUNT_ALREADY_ACTIVATED'),
      );
    }

    let hashedPassword = await PasswordUtility.hashPassword(reqBody.password);
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
    // return new ReturnChildSerializer().serialize(updatedChild);
  }
}
