enum Gender {
  Female = 'female',
  Male = 'male',
  Unknown = 'unknown',
}

export class NativeUserDto {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
  isPhoneVerified: Boolean;
}
