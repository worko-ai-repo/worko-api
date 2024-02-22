export interface UserAchievementDTO {
  achievements?: {
    title: string;
    acquiredFrom: string;
    achievDate: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}
