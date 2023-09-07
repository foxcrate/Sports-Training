import { ReturnUserDto } from '../dtos/return.dto';

export class ReturnUserSerializer {
  serialize(users: any | any[]): ReturnUserDto | ReturnUserDto[] {
    if (Array.isArray(users)) {
      let usersMapped = users.map((user) => {
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          gender: user.gender,
          birthday: user.birthday,
        };
      });
      return usersMapped;
    } else {
      let user = users;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        birthday: user.birthday,
      };
    }
  }
}
