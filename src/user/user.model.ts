import { Injectable } from '@nestjs/common';
import { ReturnChildDto } from 'src/child/dtos/return.dto';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnUserDto } from './dtos/return.dto';
import { SignupUserDto } from './dtos/signup.dto';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { NativeUserDto } from './dtos/native.dto';

@Injectable()
export class UserModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  async getUserChilds(userId): Promise<ReturnChildDto[]> {
    let userChilds: ReturnChildDto[] = await this.prisma.$queryRaw`
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
      WHERE userId = ${userId}
    `;
    return userChilds;
  }

  async create(signupData: SignupUserDto) {
    await this.prisma.$queryRaw`
    INSERT INTO User
    (
      firstName,
      lastName,
      profileImage,
      password,
      email,
      mobileNumber,
      gender,
      birthday,
      updatedAt
    )
    VALUES
    (
      ${signupData.firstName},
      ${signupData.lastName},
      ${signupData.profileImage},
      ${signupData.password},
      ${signupData.email},
      ${signupData.mobileNumber},
      ${signupData.gender},
      ${new Date(signupData.birthday)},
      ${this.globalService.getLocalDateTime(new Date())}
    )`;
  }

  async createByMobile(mobileNumber: string) {
    await this.prisma.$queryRaw`
    INSERT INTO User
    (
      mobileNumber,
      updatedAt
    )
    VALUES
    (
      ${mobileNumber},
      ${new Date()}
    )`;
  }

  async updateById(userId: string, data: CompleteSignupUserDto) {
    //complete profile
    await this.prisma.$queryRaw`
        UPDATE User
        SET
        firstName = ${data.firstName},
        lastName = ${data.lastName},
        email = ${data.email},
        profileImage = ${data.profileImage},
        gender = ${data.gender},
        birthday = ${new Date(data.birthday)},
        updatedAt = ${this.globalService.getLocalDateTime(new Date())}
        WHERE
        id = ${userId};
      `;
  }

  async updatePassword(userId: string, hashedPassword: string) {
    //update
    await this.prisma.$queryRaw`
       UPDATE User
       SET
       password = ${hashedPassword},
       updatedAt = ${new Date()}
       WHERE
       id = ${userId};
     `;
  }

  async getUserById(userId): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday
      FROM User
      WHERE id = ${userId}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getUserByMobileNumber(mobileNumber): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday
      FROM User
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getNativeUserByMobileNumber(mobileNumber): Promise<NativeUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
      *
      FROM User
      WHERE mobileNumber = ${mobileNumber}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getUserByEmail(email): Promise<ReturnUserDto> {
    let theUser = await this.prisma.$queryRaw`
      SELECT
      id,
        firstName,
        lastName,
        profileImage,
        email,
        mobileNumber,
        gender,
        birthday
      FROM User
      WHERE email = ${email}
      LIMIT 1
    `;
    return theUser[0];
  }

  async getUserChildsIds(userId: number): Promise<number[]> {
    let idsObject: any[] = await this.prisma.$queryRaw`
      SELECT id
      FROM Child
      WHERE userId = ${userId}
    `;

    // console.log({ idsObject });

    let childsIds = idsObject.map((obj) => {
      return obj.id;
    });
    return childsIds;
  }
}
