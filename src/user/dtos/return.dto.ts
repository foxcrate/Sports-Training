enum Gender {
  Female = 'female',
  Male = 'male',
  Unknown = 'unknown',
}

export class ReturnUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
}
