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
  sports: string[];
}

export interface DoctorResultDto extends BasicResultDto {
  doctorClinicId: number;
  specialization: string;
}

export interface FieldResultDto extends BasicResultDto {
  fieldId: number;
  sport: string;
}

export interface SearchResultDto {
  name: string;
  profileImage: string | null;
  coast: number;
  region: string;
  actualAverageRating: string;
  roundedAverageRating: string;
  trainerProfileId: number | null;
  sports: string[] | null;
  doctorClinicId: number | null;
  specialization: string | null;
  fieldId: number | null;
  sport: string | null;
}

export interface SearchResultsDto {
  searchResults: SearchResultDto[];
  count: number;
}
