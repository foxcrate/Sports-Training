import { AvailableRoles } from "src/auth/dtos/available-roles.dto";


export class NativeUserDto {
  id: number;
  firstName: string;
  lastName: string;
  isActivated: boolean;
  password: string;
  email: string;
  mobileNumber: string;
  userType: AvailableRoles;
  genderId: number;
  birthday: Date;
  createdAt: Date;
  isPhoneVerified: Boolean;
}
