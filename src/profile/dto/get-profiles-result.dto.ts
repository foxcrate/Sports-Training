export type GetProfileResult = {
  childId: number | null;
  trainerProfileId: number | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
};

export type GetProfilesResultDto = GetProfileResult[];
