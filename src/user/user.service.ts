import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { BadRequestException } from 'src/exceptions/bad_request.exception';
import { ReturnUserSerializer } from './serializers/return_user.serializer';
import { log } from 'console';
import { ChildService } from 'src/child/child.service';
import { ReturnChildSerializer } from 'src/child/serializers/return_child.serializer';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private childService: ChildService,
  ) {}

  async findByMobile(mobileNumber: string): Promise<any> {
    let foundedAccount = await this.prisma.user.findFirst({
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
    let repeatedAccount = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            mobileNumber: mobileNumber,
          },
        ],
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
    const newUser = await this.prisma.user.create({
      data: signupData,
    });
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

  async addChild(reqBody, userId) {
    let repeatedChild = await this.childService.findRepeated(
      reqBody.email,
      reqBody.mobileNumber,
    );

    await this.prisma.$queryRaw`
    INSERT INTO Child
      (firstName, lastName, email,mobileNumber,gender,birthday,userId,updatedAt)
      VALUES
    (${reqBody.firstName}, ${reqBody.lastName},
    ${reqBody.email},${reqBody.mobileNumber},${reqBody.gender},${
      reqBody.birthday
    },${userId},${new Date()})`;

    let newChild = await this.prisma.$queryRaw`
    SELECT *
    FROM Child
    ORDER BY createdAt DESC
    LIMIT 1`;

    return new ReturnChildSerializer().serialize(newChild[0]);
  }
}
