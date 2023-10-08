import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ReturnUserSerializer } from './serializers/return-user.serializer';
import { ChildService } from 'src/child/child.service';
import { ReturnChildSerializer } from 'src/child/serializers/return-child.serializer';
import { ReturnUserDto } from './dtos/return.dto';
import { NativeUserDto } from './dtos/native.dto';
import { ReturnChildDto } from 'src/child/dtos/return.dto';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private childService: ChildService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}

  async test() {
    // console.log('alo');

    return this.i18n.t(`test.welcome`, { lang: I18nContext.current().lang });
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

    return newUser;
  }

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

    let updatedUser = this.getLastUpdated();
    return updatedUser;

    // return new ReturnUserSerializer().serialize(updatedUser[0]);
  }

  async getOne(userId): Promise<any> {
    let user = await this.getUserById(userId);

    // return new ReturnUserSerializer().serialize(user);
    return user;
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

    // let newChild = await this.prisma.$queryRaw`
    //   SELECT *
    //   FROM Child
    //   ORDER BY createdAt DESC
    //   LIMIT 1`;

    let newChild = this.getLastCreatedChild();

    // return new ReturnChildSerializer().serialize(newChild[0]);
    return newChild;
  }

  async getChilds(userId): Promise<any> {
    let userChilds = await this.getUserChilds(userId);

    return userChilds;

    // return new ReturnChildSerializer().serialize(userChilds);
  }

  async getChild(childId, userId): Promise<any> {
    let child = await this.authorizeResource(userId, childId);

    // return new ReturnChildSerializer().serialize(child);
    return child;
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

    /////////////////////////////////////////////

    let updatedChild = this.getLastUpdatedChild();

    return updatedChild;

    // return new ReturnChildSerializer().serialize(updatedChild[0]);
  }

  async deleteChild(childId, userId): Promise<any> {
    let child = await this.authorizeResource(userId, childId);
    await this.deleteChildProfileByChildId(childId);
    await this.deleteChildById(childId);
    return child;
    // return new ReturnChildSerializer().serialize(child);
  }

  async findByMobile(mobileNumber: string): Promise<NativeUserDto> {
    let foundedAccount = await this.prisma.$queryRaw`
    SELECT *
    FROM User
    WHERE mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (!foundedAccount[0]) {
      // throw new NewBadRequestException('WRONG_CREDENTIALS');
      throw new UnauthorizedException(
        // this.globalService.getError('en', 'WRONG_CREDENTIALS'),
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
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
        // throw new NewBadRequestException('REPEATED_EMAIL');
        throw new BadRequestException(
          // this.globalService.getError('en', 'REPEATED_EMAIL'),
          this.i18n.t(`errors.REPEATED_EMAIL`, { lang: I18nContext.current().lang }),
        );
      }
      if (repeatedUserProfile[0].mobileNumber == mobileNumber) {
        // throw new NewBadRequestException('REPEATED_MOBILE_NUMBER');
        throw new BadRequestException(
          // this.globalService.getError('en', 'REPEATED_MOBILE_NUMBER'),
          this.i18n.t(`errors.REPEATED_MOBILE_NUMBER`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }

  private async getUserById(userId): Promise<ReturnUserDto> {
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

  private async getChildById(childId): Promise<ReturnChildDto> {
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
      WHERE id = ${childId}
      LIMIT 1
    `;
    return theChild[0];
  }

  private async deleteChildById(childId) {
    await this.prisma.$queryRaw`
    DELETE FROM
    Child
    WHERE
    id = ${childId};`;
  }

  private async deleteChildProfileByChildId(childId) {
    let childProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM
      ChildProfile
      WHERE
      childId = ${childId};`;

    if (childProfile[0]) {
      await this.deleteChildProfileSportsByChildProfileId(childProfile[0].id);

      await this.prisma.$queryRaw`
      DELETE FROM
      ChildProfile
      WHERE
      id = ${childProfile[0].id};`;
    }
  }

  private async deleteChildProfileSportsByChildProfileId(childProfileId) {
    await this.prisma.$queryRaw`
      DELETE FROM
      ChildProfileSports
      WHERE
      childProfileId = ${childProfileId};`;
  }

  private async getUserChilds(userId): Promise<any> {
    let userChilds = await this.prisma.$queryRaw`
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
    // if (playerProfile[0]) {
    return userChilds;
    // } else {
    //   console.log('exception --');
    //   throw new NewBadRequestException('RECORD_NOT_FOUND');
    // }
  }

  private async getLastCreated(): Promise<ReturnUserDto> {
    let lastCreated = await this.prisma.$queryRaw`
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
    ORDER BY createdAt DESC
    LIMIT 1`;
    return lastCreated[0];
  }

  private async getLastUpdated(): Promise<ReturnUserDto> {
    let lastUpdated = await this.prisma.$queryRaw`
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
    ORDER BY updatedAt DESC
    LIMIT 1`;
    return lastUpdated[0];
  }

  private async getLastCreatedChild(): Promise<ReturnChildDto> {
    let createdChild = await this.prisma.$queryRaw`
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
    ORDER BY createdAt DESC
    LIMIT 1`;
    return createdChild[0];
  }

  private async getLastUpdatedChild(): Promise<ReturnChildDto> {
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
      ORDER BY updatedAt DESC
      LIMIT 1`;

    return updatedChild[0];
  }

  private async authorizeResource(
    userId: number,
    childId: number,
  ): Promise<ReturnChildDto> {
    //get childProfile
    let child = await this.getChildById(childId);
    if (!child) {
      // throw new NewBadRequestException('RECORD_NOT_FOUND');
      throw new NotFoundException(
        // this.globalService.getError('en', 'RECORD_NOT_FOUND')
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    // console.log({ child });

    // let childId = child.id;

    //get current user childs
    let childs = await this.getUserChilds(userId);
    let childsIds = childs.map((child) => {
      return child.id;
    });
    // childId = parseInt(childId);

    //check if the child is the current user's child
    if (!childsIds.includes(child.id)) {
      // throw new NewBadRequestException('UNAUTHORIZED');
      throw new ForbiddenException(
        // this.globalService.getError('en', 'UNAUTHORIZED')
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    return child;
  }
}
