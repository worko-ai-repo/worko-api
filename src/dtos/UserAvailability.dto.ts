export interface UserAvailabilityDTO {
  bookingPeriod: number;
  noticePeriod: {
    value: number;
    unit: string;
  };
  pauseAvailability: boolean;
  availability: {
    dayCode: number;
    dayEnabled: number;
    times: {
      startTime: string;
      endTime: string;
    }[];
  }[];
}
