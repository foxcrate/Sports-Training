enum Gender {
  Female = 'female',
  Male = 'male',
}

export class ReturnUserDto {
  id: number;
  firstName: string;
  lastName: string;
  isActivated: boolean;
  profileImage: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  birthday: Date;
  createdAt: Date;
}
