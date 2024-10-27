import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ReturnUserDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { UserRepository } from './user.repository';
import { PlayerProfileRepository } from 'src/player-profile/player-profile.repository';
import { ADDITIONAL_SELECT_COLUMNS, FIND_BY } from './user-enums';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private playerProfileRepository: PlayerProfileRepository,
    private readonly i18n: I18nService,
  ) {}

  async create(signupData: SignupUserDto): Promise<ReturnUserDto> {
    await this.userRepository.create(signupData);

    let newUser = await this.userRepository.findBy(
      FIND_BY.MOBILE_NUMBER,
      signupData.mobileNumber,
    );

    return newUser;
  }

  async createByMobile(mobileNumber: string): Promise<ReturnUserDto> {
    await this.userRepository.create({ mobileNumber: mobileNumber });
    let createdUser = await this.userRepository.findBy(
      FIND_BY.MOBILE_NUMBER,
      mobileNumber,
    );
    return createdUser;
  }

  async getAll(): Promise<ReturnUserDto[]> {
    let allUsers = await this.userRepository.getAll();
    return allUsers;
  }

  async completeSignup(userId: number, completeSignupUserDto: CompleteSignupUserDto) {
    let theUser = await this.userRepository.findBy(FIND_BY.MOBILE_NUMBER, userId);

    //complete profile
    await this.userRepository.completeSignup(userId, completeSignupUserDto);

    return await this.userRepository.findBy(FIND_BY.ID, theUser.id);
  }

  async update(reqBody, userId): Promise<ReturnUserDto> {
    let user = await this.userRepository.findBy(FIND_BY.ID, userId);

    //update
    await this.userRepository.updateById(userId, reqBody);

    return await this.userRepository.findBy(FIND_BY.ID, user.id);
  }

  async getOne(userId): Promise<ReturnUserDto> {
    let user = await this.userRepository.findBy(FIND_BY.ID, userId);

    return user;
  }

  async createDefaultPlayerProfile(userId: number) {
    await this.playerProfileRepository.createIfNotExist(userId);
  }

  async createChild(reqBody, userId) {
    await this.findRepeated(reqBody.email, reqBody.mobileNumber);

    await this.userRepository.createChild(reqBody, userId);

    let newChild = await this.userRepository.findBy(
      FIND_BY.MOBILE_NUMBER,
      reqBody.mobileNumber,
    );

    // create default player profile
    await this.createDefaultPlayerProfile(newChild.id);

    return newChild;
  }

  async getChilds(userId): Promise<ReturnUserDto[]> {
    let userChilds = await this.userRepository.getChilds(userId);

    return userChilds;
  }

  async getChild(childId, userId): Promise<ReturnUserDto> {
    let child = await this.authorizeChildResource(userId, childId);

    return child;
  }

  async updateChild(reqBody, childId, userId) {
    let child = await this.authorizeChildResource(userId, childId);

    await this.userRepository.updateById(child.id, reqBody);

    let updatedChild = await this.userRepository.findBy(FIND_BY.ID, child.id);

    return updatedChild;
  }

  async deleteChild(childId, userId): Promise<ReturnUserDto> {
    let child = await this.authorizeChildResource(userId, childId);

    let childProfile = await this.playerProfileRepository.getOneByUserId(childId);

    Promise.all([
      await this.playerProfileRepository.deletePlayerSports(childProfile?.id),
      await this.playerProfileRepository.deleteByUserId(childId),
      await this.userRepository.deleteChildRelations(childId),
    ]);

    await this.userRepository.deleteById(childId);

    return child;
  }

  async findByMobile(mobileNumber: string): Promise<ReturnUserDto> {
    let foundedAccount = await this.userRepository.findBy(
      FIND_BY.MOBILE_NUMBER,
      mobileNumber,
      [
        ADDITIONAL_SELECT_COLUMNS.PASSWORD,
        ADDITIONAL_SELECT_COLUMNS.IS_ACTIVATED,
        ADDITIONAL_SELECT_COLUMNS.IS_PHONE_VERIFIED,
        ADDITIONAL_SELECT_COLUMNS.USER_TYPE,
      ],
    );

    if (!foundedAccount) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }
    return foundedAccount;
  }

  async findRepeated(email, mobileNumber): Promise<boolean> {
    Promise.all([
      await this.findRepeatedMobile(mobileNumber),
      await this.findRepeatedEmail(email),
    ]);
    // await this.findRepeatedMobile(mobileNumber);
    // await this.findRepeatedEmail(email);

    return false;
  }

  async findRepeatedMobile(mobileNumber): Promise<boolean> {
    //Chick existed  phone number
    let repeatedMobile = await this.userRepository.findBy(
      FIND_BY.MOBILE_NUMBER,
      mobileNumber,
    );

    if (repeatedMobile) {
      if (repeatedMobile.mobileNumber == mobileNumber) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_MOBILE_NUMBER`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }

  async findRepeatedEmail(email): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedEmail = await this.userRepository.findBy(FIND_BY.EMAIL, email);

    if (repeatedEmail) {
      if (repeatedEmail.email == email) {
        throw new BadRequestException(
          this.i18n.t(`errors.REPEATED_EMAIL`, {
            lang: I18nContext.current().lang,
          }),
        );
      }
    }
    return false;
  }

  async validateParentChildRelation(parentId: number, childId: number): Promise<boolean> {
    //get child
    let child = await this.userRepository.findBy(FIND_BY.ID, childId);
    if (!child) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //check if the child is the current user's child
    if (!(await this.userRepository.isMyChild(parentId, childId))) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async authorizeChildResource(
    userId: number,
    childId: number,
  ): Promise<ReturnUserDto> {
    //get childProfile

    let child = await this.userRepository.findBy(FIND_BY.ID, childId);
    if (!child) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //check if the child is the current user's child
    if (!(await this.userRepository.isMyChild(userId, childId))) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }
    return child;
  }
}
