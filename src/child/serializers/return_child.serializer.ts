import { ReturnChildDto } from '../dtos/return.dto';

export class ReturnChildSerializer {
  serialize(childs: any | any[]): ReturnChildDto | ReturnChildDto[] {
    //If array of users passed
    if (Array.isArray(childs)) {
      let childsMapped = childs.map((child) => {
        return {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          email: child.email,
          mobileNumber: child.mobileNumber,
          gender: child.gender,
          birthday: child.birthday,
          userId: child.userId,
        };
      });
      return childsMapped;
      //If one user passed
    } else {
      let child = childs;
      child = {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        email: child.email,
        mobileNumber: child.mobileNumber,
        gender: child.gender,
        birthday: child.birthday,
        userId: child.userId,
      };
      return child;
    }
  }
}
