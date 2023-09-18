enum Gender {
  Female = 'female',
  Male = 'male',
}

export class SignupChildDto {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
  userId: number;
}
