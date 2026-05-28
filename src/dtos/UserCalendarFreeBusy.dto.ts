export interface FreeBusyAttendeeDto {
  userEmail: string;
  userName?: string;
}

export type FreeBusyBatchQueryItem = string | FreeBusyAttendeeDto;

export interface SaveIcalUrlApiDto {
  icalUrl: string;
  email?: string;
}
