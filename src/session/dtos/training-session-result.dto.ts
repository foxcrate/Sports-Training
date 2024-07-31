import { ApiProperty } from '@nestjs/swagger';

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

class TrainingSessionResult implements TrainingSessionResultDto {
  @ApiProperty()
  sessionId: number;

  @ApiProperty()
  slotId: number;

  @ApiProperty()
  sessionDate: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  specialization?: string;

  @ApiProperty()
  sport?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  sports?: string;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  coachLevel?: string;

  @ApiProperty()
  playerLevel?: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  constructor(data: TrainingSessionResultDto) {
    this.sessionId = data.sessionId;
    this.sessionDate = data.sessionDate;
    this.name = data.name;
    this.profileImage = data.profileImage;
    this.region = data.region;
    this.cost = data.cost;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.specialization = data.specialization;
    this.sport = data.sport;
    this.description = data.description;
    this.sports = data.sports;
    this.status = data.status;
    this.coachLevel = data.coachLevel;
    this.playerLevel = data.playerLevel;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }
}

export { TrainingSessionResult };
