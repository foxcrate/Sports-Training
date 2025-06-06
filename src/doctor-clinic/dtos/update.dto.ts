export class DoctorClinicUpdateDto {
  name: string;
  description: string;
  cost: number;
  slotDuration: number;
  address: string;
  longitude: number;
  latitude: number;
  profileImage: string;
  regionId: number;
  doctorClinicSpecializationId: number;
  availableWeekDays: string;
  startTime: string;
  endTime: string;
}
