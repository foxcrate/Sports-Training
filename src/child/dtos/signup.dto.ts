enum Gender {
  Female = 'female',
  Male = 'male',
}

export class SignupChildDto {
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
}
