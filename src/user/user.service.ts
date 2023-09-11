import { HttpException, HttpStatus, Injectable, Request } from '@nestjs/common';
import { Request as ExressRequest } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { BadRequestException } from 'src/exceptions/badRequest.exception';
import { ReturnUserSerializer } from './serializers/returnUser.serializer';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByMobile(mobileNumber: string): Promise<any> {
    let foundedAccount = await this.prisma.user.findFirst({
      where: {
        mobileNumber: mobileNumber,
      },
    });

    if (!foundedAccount) {
      throw new BadRequestException('MOBILE_NUMBER_NOT_FOUND');
    }

    return foundedAccount;
  }

  async findRepeated(email, mobileNumber): Promise<Boolean> {
    let repeatedAccount = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { mobileNumber: mobileNumber }],
      },
    });
    if (repeatedAccount) {
      if (repeatedAccount.email == email) {
        throw new BadRequestException('REPEATED_EMAIL');
      }
      if (repeatedAccount.mobileNumber == mobileNumber) {
        throw new BadRequestException('REPEATED_MOBILE_NUMBER');
      }
    }
    return false;
  }

  async create(signupData: SignupUserDto): Promise<any> {
    const newUser = await this.prisma.user.create({ data: signupData });
    return newUser;
  }

  async verifyPhone(req) {
    // console.log('req:', req);
    let user = await this.prisma.user.update({
      where: {
        id: req.id,
      },
      data: {
        isPhoneVerified: true,
      },
    });

    return new ReturnUserSerializer().serialize(user);
  }
}
