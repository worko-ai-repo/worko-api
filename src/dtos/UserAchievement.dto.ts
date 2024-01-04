export interface UserAchievementDTO {
  achievements?: {
    title: string;
    desc?: string;
    achievDate: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}
