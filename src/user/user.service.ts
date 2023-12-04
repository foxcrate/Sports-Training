import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ReturnUserDto } from './dtos/return.dto';
import { NativeUserDto } from './dtos/native.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { UserModel } from './user.model';
import { PlayerProfileModel } from 'src/player-profile/player-profile.model';

@Injectable()
export class UserService {
  constructor(
    private userModel: UserModel,
    private playerProfileModel: PlayerProfileModel,
    private readonly i18n: I18nService,
  ) {}

  async create(signupData: SignupUserDto): Promise<ReturnUserDto> {
    await this.userModel.create(signupData);

    let newUser = await this.userModel.getByMobileNumber(signupData.mobileNumber);

    return newUser;
  }

  async createByMobile(mobileNumber: string): Promise<ReturnUserDto> {
    await this.userModel.createByMobile(mobileNumber);
    let createdUser = await this.userModel.getByMobileNumber(mobileNumber);
    return createdUser;
  }

  async completeSignup(userId: number, completeSignupUserDto: CompleteSignupUserDto) {
    let theUser = await this.userModel.getById(userId);

    //complete profile
    await this.userModel.updateById(userId, completeSignupUserDto);

    return this.userModel.getById(theUser.id);
  }

  async update(reqBody, userId) {
    let user = await this.userModel.getById(userId);

    //update
    await this.userModel.updateById(userId, reqBody);

    return await this.userModel.getById(user.id);
  }

  async getOne(userId): Promise<ReturnUserDto> {
    let user = await this.userModel.getById(userId);

    return user;
  }

  async createChild(reqBody, userId) {
    await this.findRepeated(reqBody.email, reqBody.mobileNumber);

    await this.userModel.createChild(reqBody, userId);

    let newChild = await this.userModel.getByMobileNumber(reqBody.mobileNumber);

    return newChild;
  }

  async getChilds(userId): Promise<ReturnUserDto[]> {
    let userChilds = await this.userModel.getChilds(userId);

    return userChilds;
  }

  async getChild(childId, userId): Promise<ReturnUserDto> {
    let child = await this.authorizeChildResource(userId, childId);

    return child;
  }

  async updateChild(reqBody, childId, userId) {
    let child = await this.authorizeChildResource(userId, childId);

    await this.userModel.updateById(child.id, reqBody);

    let updatedChild = await this.userModel.getById(child.id);

    return updatedChild;
  }

  //NOTE: you have around 300 implicit any variables. this is really not a good practice. you need to inforce certain types so the complier can yell when it is necessary
  async deleteChild(childId, userId): Promise<ReturnUserDto> {
    let child = await this.authorizeChildResource(userId, childId);
    await this.playerProfileModel.deleteByUserId(childId);
    await this.userModel.deleteChildRelations(childId);
    await this.userModel.deleteById(childId);

    return child;
  }

  async findByMobile(mobileNumber: string): Promise<NativeUserDto> {
    let foundedAccount = await this.userModel.getNativeByMobileNumber(mobileNumber);

    if (!foundedAccount) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }
    return foundedAccount;
  }

  async findRepeated(email, mobileNumber): Promise<boolean> {
    await this.findRepeatedMobile(mobileNumber);
    await this.findRepeatedEmail(email);

    return false;
  }

  async findRepeatedMobile(mobileNumber): Promise<boolean> {
    //Chick existed  phone number
    let repeatedMobile = await this.userModel.getByMobileNumber(mobileNumber);

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
    let repeatedEmail = await this.userModel.getByEmail(email);

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

  private async authorizeChildResource(
    userId: number,
    childId: number,
  ): Promise<ReturnUserDto> {
    //get childProfile
    //NOTE: this would be better if u had a function that fetch the child and checks if it belongs to a parent of given id instead of doing two queries
    //Nevertheless it is not a big performance issue as it is would be very short list but for future reference use the db initiall to do all the checkups not in code
    //This helps with isolating bussiness logic with db layer
    let child = await this.userModel.getById(childId);
    if (!child) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //get current user childs
    let childs = await this.userModel.getChilds(userId);
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
