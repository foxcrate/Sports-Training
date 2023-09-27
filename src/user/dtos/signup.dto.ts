enum Gender {
  Female = 'female',
  Male = 'male',
}

export class SignupUserDto {
  firstName: string;
  lastName: string;
  profileImage: string;
  password: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
}
