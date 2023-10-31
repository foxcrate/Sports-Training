import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ChildService } from 'src/child/child.service';
import { ReturnUserDto } from './dtos/return.dto';
import { NativeUserDto } from './dtos/native.dto';
import { ReturnChildDto } from 'src/child/dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private childService: ChildService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}

  async test() {
    return this.i18n.t(`test.welcome`, { lang: I18nContext.current().lang });
  }

  async create(signupData: SignupUserDto): Promise<ReturnUserDto> {
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

    let newUser = await this.getUserByMobileNumber(signupData.mobileNumber);

    return newUser;
  }

  async completeSignup(userId: string, completeSignupUserDto: CompleteSignupUserDto) {
    let theUser = await this.getUserById(userId);

    //complete profile
    await this.prisma.$queryRaw`
        UPDATE User
        SET
        firstName = ${completeSignupUserDto.firstName},
        lastName = ${completeSignupUserDto.lastName},
        profileImage = ${completeSignupUserDto.profileImage},
        gender = ${completeSignupUserDto.gender},
        birthday = ${completeSignupUserDto.birthday},
        updatedAt = ${this.globalService.getLocalDateTime(new Date())}
        WHERE
        id = ${theUser.id};
      `;

    // let updatedUser = this.getLastUpdated();
    let updatedUser = this.getUserById(theUser.id);

    return updatedUser;
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
      updatedAt = ${this.globalService.getLocalDateTime(new Date())}
      WHERE
      id = ${user.id};
    `;

    // let updatedUser = this.getLastUpdated();
    let updatedUser = this.getUserById(user.id);

    return updatedUser;
  }

  async getOne(userId): Promise<ReturnUserDto> {
    let user = await this.getUserById(userId);

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
      ${this.globalService.getLocalDateTime(new Date())})`;

    // let newChild = this.getLastCreatedChild();
    let newChild = this.getChildByMobileNumber(reqBody.mobileNumber);

    return newChild;
  }

  async getChilds(userId): Promise<ReturnChildDto[]> {
    let userChilds = await this.getUserChilds(userId);

    return userChilds;
  }

  async getChild(childId, userId): Promise<ReturnChildDto> {
    let child = await this.authorizeResource(userId, childId);

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
      updatedAt = ${this.globalService.getLocalDateTime(new Date())}
      WHERE
      id = ${child.id};
    `;

    // let updatedChild = this.getLastUpdatedChild();
    let updatedChild = this.getChildById(child.id);

    return updatedChild;
  }

  async deleteChild(childId, userId): Promise<ReturnChildDto> {
    let child = await this.authorizeResource(userId, childId);
    await this.deleteChildProfileByChildId(childId);
    await this.deleteChildById(childId);
    return child;
  }

  async findByMobile(mobileNumber: string): Promise<NativeUserDto> {
    let foundedAccount = await this.prisma.$queryRaw`
    SELECT *
    FROM User
    WHERE mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (!foundedAccount[0]) {
      throw new UnauthorizedException(
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
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_EMAIL`, { lang: I18nContext.current().lang }),
        );
      }
      if (repeatedUserProfile[0].mobileNumber == mobileNumber) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_MOBILE_NUMBER`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }

  async findRepeatedMobile(mobileNumber): Promise<Boolean> {
    //Chick existed  phone number
    let repeatedMobile = await this.prisma.$queryRaw`
    SELECT *
    FROM User
    WHERE
    mobileNumber = ${mobileNumber}
    LIMIT 1
    `;

    if (repeatedMobile[0]) {
      if (repeatedMobile[0].mobileNumber == mobileNumber) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_MOBILE_NUMBER`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }

  async findRepeatedEmail(email): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedEmail = await this.prisma.$queryRaw`
    SELECT *
    FROM User
    WHERE
    email = ${email}
    LIMIT 1
    `;

    if (repeatedEmail[0]) {
      if (repeatedEmail[0].email == email) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_EMAIL`, {
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

  private async getUserByMobileNumber(mobileNumber): Promise<ReturnUserDto> {
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

  private async getChildByMobileNumber(mobileNumber): Promise<ReturnChildDto> {
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

  private async getUserChilds(userId): Promise<ReturnChildDto[]> {
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

  private async authorizeResource(
    userId: number,
    childId: number,
  ): Promise<ReturnChildDto> {
    //get childProfile
    let child = await this.getChildById(childId);
    if (!child) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //get current user childs
    let childs = await this.getUserChilds(userId);
    let childsIds = childs.map((child) => {
      return child.id;
    });

    //check if the child is the current user's child
    if (!childsIds.includes(child.id)) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    return child;
  }
}
