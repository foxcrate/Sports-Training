import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dtos/create.dto';
import { BadRequestException } from 'src/exceptions/badRequest.exception';
import { hashPassword } from '../utils/passwordHasher.util';
import { ReturnUserSerializer } from './serializers/returnUser.serializer';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService, // private jwt: JwtService,
  ) {}

  async signup(signupData: CreateUserDto) {
    let repeatedAccount = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: signupData.email },
          { mobileNumber: signupData.mobileNumber },
        ],
      },
    });

    if (repeatedAccount) {
      if (repeatedAccount.email == signupData.email) {
        throw new BadRequestException('REPEATED_EMAIL');
      }
      if (repeatedAccount.mobileNumber == signupData.mobileNumber) {
        throw new BadRequestException('REPEATED_MOBILE_NUMBER');
      }
    }
    signupData.password = await hashPassword(signupData.password);

    const newUser = await this.prisma.user.create({ data: signupData });
    return new ReturnUserSerializer().serialize(newUser);
  }
}
