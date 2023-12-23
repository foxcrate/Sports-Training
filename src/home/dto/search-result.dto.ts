export interface BasicResultDto {
  name: string;
  profileImage: string;
  coast: number;
  region: string;
  actualAverageRating: string;
  roundedAverageRating: string;
}
export interface CoachResultDto extends BasicResultDto {
  trainerProfileId: number;
  sports: { id: number; name: string }[];
}

export interface DoctorResultDto extends BasicResultDto {
  doctorClinicId: number;
  specialization: string;
}

export interface FieldResultDto extends BasicResultDto {
  fieldId: number;
  sport: string;
}
