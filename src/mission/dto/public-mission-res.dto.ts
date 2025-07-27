export class PublicMissionResDto {
  id: number;
  icon?: string;
  name: string;
  repeatType: string;
  repeatDays: string[];
  description: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
