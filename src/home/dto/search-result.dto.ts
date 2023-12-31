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
