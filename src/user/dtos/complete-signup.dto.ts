enum Gender {
  Female = 'female',
  Male = 'male',
}

export class CompleteSignupUserDto {
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
  gender: Gender;
  birthday: Date;
}
