enum Gender {
  Female = 'female',
  Male = 'male',
}

export class NativeChildDto {
  id: number;
  firstName: string;
  lastName: string;
  profileImage: string;
  password: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
  isPhoneVerified: boolean;
  userId: number;
}
