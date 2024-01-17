export interface TrainingSessionBaseDto {
  sessionId: number;
  sessionDate: string;
  name?: string;
  profileImage: string;
  region: string;
  cost: number;
  startTime: string;
  endTime: string;
}

export interface DoctorTrainingSessionResultDto extends TrainingSessionBaseDto {
  specialization?: string;
}

export interface FieldTrainingSessionResultDto extends TrainingSessionBaseDto {
  sport?: string;
  description?: string;
}

export interface CoachTrainingSessionResultDto extends TrainingSessionBaseDto {
  sports?: string;
  status?: string;
  coachLevel?: string;
  playerLevel?: string;
  firstName?: string;
  lastName?: string;
}

export interface TrainingSessionResultDto
  extends DoctorTrainingSessionResultDto,
    FieldTrainingSessionResultDto,
    CoachTrainingSessionResultDto {}
