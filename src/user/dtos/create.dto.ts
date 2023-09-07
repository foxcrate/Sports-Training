enum Gender {
  Female = 'female',
  Male = 'male',
  Unknown = 'unknown',
}

export class CreateUserDto {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
}
