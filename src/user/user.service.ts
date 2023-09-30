import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { ReturnUserSerializer } from './serializers/return_user.serializer';
import { log } from 'console';
import { ChildService } from 'src/child/child.service';
import { ReturnChildSerializer } from 'src/child/serializers/return_child.serializer';
import { ReturnChildProfileSerializer } from 'src/child_profile/serializers/return.serializer';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private childService: ChildService,
  ) {}

  async update(reqBody, userId) {
    let user = await this.getUserById(userId);

    //update
    await this.prisma.$queryRaw`
      UPDATE User
      SET
      firstName = ${reqBody.firstName},
      lastName = ${reqBody.lastName},
      profileImage = ${reqBody.profileImage},
      gender = ${reqBody.gender},
      birthday = ${reqBody.birthday},
      updatedAt = ${new Date()}
      WHERE
      id = ${user.id};
    `;

    let updatedUser = await this.prisma.$queryRaw`
      SELECT *
      FROM User
      ORDER BY updatedAt DESC
      LIMIT 1`;

    return new ReturnUserSerializer().serialize(updatedUser[0]);
  }

  async createChild(reqBody, userId) {
    let repeatedChild = await this.childService.findRepeated(
      reqBody.email,
      reqBody.mobileNumber,
    );

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
      ${new Date()})`;

    let newChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      ORDER BY createdAt DESC
      LIMIT 1`;

    return new ReturnChildSerializer().serialize(newChild[0]);
  }

  async getOne(userId): Promise<any> {
    let user = await this.getUserById(userId);

    return new ReturnUserSerializer().serialize(user);
  }

  async getChilds(userId): Promise<any> {
    let userChilds = await this.getUserChilds(userId);

    return new ReturnChildSerializer().serialize(userChilds);
  }

  async getChild(childId, userId): Promise<any> {
    let child = await this.authorizeResource(userId, childId);

    return new ReturnChildSerializer().serialize(child);
  }

  async updateChild(reqBody, childId, userId) {
    let child = await this.authorizeResource(userId, childId);

    //update
    await this.prisma.$queryRaw`
      UPDATE Child
      SET
      firstName = ${reqBody.firstName},
      lastName = ${reqBody.lastName},
      profileImage = ${reqBody.profileImage},
      gender = ${reqBody.gender},
      birthday = ${reqBody.birthday},
      updatedAt = ${new Date()}
      WHERE
      id = ${child.id};
    `;

    let updatedChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      ORDER BY updatedAt DESC
      LIMIT 1`;

    return new ReturnChildSerializer().serialize(updatedChild[0]);
  }

  async deleteChild(childId, userId): Promise<any> {
    let child = await this.authorizeResource(userId, childId);
    await this.deleteChildById(childId);
    return new ReturnChildSerializer().serialize(child);
  }

  async create(signupData: SignupUserDto): Promise<any> {
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
      ${new Date()}
    )`;

    let newUser = await this.getLastCreated();

    return newUser[0];
  }

  async findByMobile(mobileNumber: string): Promise<any> {
    let foundedAccount = await this.prisma.$queryRaw`
    SELECT *
    FROM User
    WHERE mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (!foundedAccount[0]) {
      throw new NewBadRequestException('WRONG_CREDENTIALS');
    }
    return foundedAccount[0];
  }

  async findRepeated(email, mobileNumber): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedUserProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM User
    WHERE email = ${email}
    OR
    mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (repeatedUserProfile[0]) {
      if (repeatedUserProfile[0].email == email) {
        throw new NewBadRequestException('REPEATED_EMAIL');
      }
      if (repeatedUserProfile[0].mobileNumber == mobileNumber) {
        throw new NewBadRequestException('REPEATED_MOBILE_NUMBER');
      }
    }
    return false;
  }

  private async getUserById(userId): Promise<any> {
    let theUser = await this.prisma.$queryRaw`
      SELECT *
      FROM User
      WHERE id = ${userId}
      LIMIT 1
    `;
    // if (playerProfile[0]) {
    return theUser[0];
    // } else {
    //   console.log('exception --');
    //   throw new NewBadRequestException('RECORD_NOT_FOUND');
    // }
  }

  private async getChildById(childId): Promise<any> {
    let theChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE id = ${childId}
      LIMIT 1
    `;
    // if (playerProfile[0]) {
    return theChild[0];
    // } else {
    //   console.log('exception --');
    //   throw new NewBadRequestException('RECORD_NOT_FOUND');
    // }
  }

  private async deleteChildById(childId) {
    await this.prisma.$queryRaw`
    DELETE FROM
    Child
    WHERE
    id = ${childId};
`;
  }

  private async getUserChilds(userId): Promise<any> {
    let userChilds = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE userId = ${userId}
    `;
    // if (playerProfile[0]) {
    return userChilds;
    // } else {
    //   console.log('exception --');
    //   throw new NewBadRequestException('RECORD_NOT_FOUND');
    // }
  }

  private async getLastCreated(): Promise<any> {
    return await this.prisma.$queryRaw`
    SELECT *
    FROM User
    ORDER BY createdAt DESC
    LIMIT 1`;
  }

  private async authorizeResource(userId: number, childId: number): Promise<any> {
    //get childProfile
    let child = await this.getChildById(childId);
    if (!child) {
      throw new NewBadRequestException('RECORD_NOT_FOUND');
    }
    console.log({ child });

    // let childId = child.id;

    //get current user childs
    let childs = await this.getUserChilds(userId);
    let childsIds = childs.map((child) => {
      return child.id;
    });
    // childId = parseInt(childId);

    //check if the child is the current user's child
    if (!childsIds.includes(child.id)) {
      throw new NewBadRequestException('UNAUTHORIZED');
    }
    return child;
  }
}
