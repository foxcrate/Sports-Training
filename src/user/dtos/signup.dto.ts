enum Gender {
  Female = 'female',
  Male = 'male',
  Unknown = 'unknown',
}

export class SignupUserDto {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
}
