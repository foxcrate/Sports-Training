import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupChildDto } from 'src/child/dtos/signup.dto';
import { BadRequestException } from 'src/exceptions/bad_request.exception';
import { ReturnChildSerializer } from './serializers/return_child.serializer';
import { PasswordUtility } from '../utils/password.util';

@Injectable()
export class ChildService {
  constructor(private prisma: PrismaService) {}

  async findByMobile(mobileNumber: string): Promise<any> {
    let foundedAccount = await this.prisma.child.findFirst({
      where: {
        mobileNumber: mobileNumber,
      },
    });

    if (!foundedAccount) {
      throw new BadRequestException('WRONG_CREDENTIALS');
    }

    return foundedAccount;
  }

  async findRepeated(email, mobileNumber): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedChild = await this.prisma.$queryRaw`SELECT *
    FROM Child
    WHERE email = ${email} OR mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (repeatedChild[0]) {
      if (repeatedChild[0].email == email) {
        throw new BadRequestException('REPEATED_EMAIL');
      }
      if (repeatedChild[0].mobileNumber == mobileNumber) {
        throw new BadRequestException('REPEATED_MOBILE_NUMBER');
      }
    }
    return false;
  }

  async create(signupData: SignupChildDto): Promise<any> {
    const newChild = await this.prisma.child.create({ data: signupData });
    return newChild;
  }

  async findByMobileNumber(mobileNumber: string) {
    //Chick existed email or phone number
    let foundedChild = await this.prisma.$queryRaw`SELECT *
        FROM Child
        WHERE mobileNumber = ${mobileNumber}
        LIMIT 1
        `;

    if (!foundedChild[0]) {
      throw new BadRequestException('WRONG_CREDENTIALS');
    }

    return foundedChild[0];
  }

  async activateAccount(reqBody) {
    let child = await this.findByMobileNumber(reqBody.mobileNumber);

    if (child.password !== null) {
      throw new BadRequestException('ACCOUNT_ALREADY_ACTIVATED');
    }

    let hashedPassword = await PasswordUtility.hashPassword(reqBody.password);
    await this.prisma.$queryRaw`UPDATE Child
      SET password = ${hashedPassword}
      WHERE id = ${child.id}
      `;

    let updatedChild = await this.prisma.$queryRaw`SELECT *
      FROM Child
      WHERE id = ${child.id}
      LIMIT 1
      `;
    return new ReturnChildSerializer().serialize(updatedChild);
  }
}
