import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ChildService } from 'src/child/child.service';
import { ReturnUserDto } from './dtos/return.dto';
import { NativeUserDto } from './dtos/native.dto';
import { ReturnChildDto } from 'src/child/dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CompleteSignupUserDto } from './dtos/complete-signup.dto';
import { UserModel } from './user.model';
import { ChildProfileModel } from 'src/child-profile/child-profile.model';

@Injectable()
export class UserService {
  constructor(
    private childService: ChildService,
    private userModel: UserModel,
    private childProfileModel: ChildProfileModel,
    private readonly i18n: I18nService,
  ) {}

  async create(signupData: SignupUserDto): Promise<ReturnUserDto> {
    await this.userModel.create(signupData);

    let newUser = await this.userModel.getUserByMobileNumber(signupData.mobileNumber);

    return newUser;
  }

  async createByMobile(mobileNumber: string): Promise<ReturnUserDto> {
    await this.userModel.createByMobile(mobileNumber);
    let createdUser = await this.userModel.getUserByMobileNumber(mobileNumber);
    return createdUser;
  }

  async completeSignup(userId: string, completeSignupUserDto: CompleteSignupUserDto) {
    let theUser = await this.userModel.getUserById(userId);

    //complete profile
    await this.userModel.updateById(userId, completeSignupUserDto);

    return this.userModel.getUserById(theUser.id);
  }

  async update(reqBody, userId) {
    let user = await this.userModel.getUserById(userId);

    //update
    await this.userModel.updateById(userId, reqBody);

    return await this.userModel.getUserById(user.id);
  }

  async getOne(userId): Promise<ReturnUserDto> {
    let user = await this.userModel.getUserById(userId);

    return user;
  }

  async createChild(reqBody, userId) {
    await this.childService.findRepeated(reqBody.email, reqBody.mobileNumber);

    await this.childService.createByUser(reqBody, userId);

    let newChild = await this.childService.getByMobileNumber(reqBody.mobileNumber);

    return newChild;
  }

  async getChilds(userId): Promise<ReturnChildDto[]> {
    let userChilds = await this.userModel.getUserChilds(userId);

    return userChilds;
  }

  async getChild(childId, userId): Promise<ReturnChildDto> {
    let child = await this.authorizeResource(userId, childId);

    return child;
  }

  async updateChild(reqBody, childId, userId) {
    let child = await this.authorizeResource(userId, childId);

    await this.childService.updateById(child.id, reqBody);

    let updatedChild = await this.childService.getChildById(child.id);

    return updatedChild;
  }

  async deleteChild(childId, userId): Promise<ReturnChildDto> {
    let child = await this.authorizeResource(userId, childId);
    await this.childProfileModel.deleteByChildId(childId);
    await this.childService.deleteById(childId);
    return child;
  }

  async findByMobile(mobileNumber: string): Promise<NativeUserDto> {
    let foundedAccount = await this.userModel.getNativeUserByMobileNumber(mobileNumber);

    if (!foundedAccount) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }
    return foundedAccount;
  }

  async findRepeated(email, mobileNumber): Promise<Boolean> {
    await this.findRepeatedMobile(mobileNumber);
    await this.findRepeatedEmail(email);

    return false;
  }

  async findRepeatedMobile(mobileNumber): Promise<Boolean> {
    //Chick existed  phone number
    let repeatedMobile = await this.userModel.getUserByMobileNumber(mobileNumber);

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

  async findRepeatedEmail(email): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedEmail = await this.userModel.getUserByEmail(email);

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

  private async authorizeResource(
    userId: number,
    childId: number,
  ): Promise<ReturnChildDto> {
    //get childProfile
    let child = await this.childService.getChildById(childId);
    if (!child) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //get current user childs
    let childs = await this.userModel.getUserChilds(userId);
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
