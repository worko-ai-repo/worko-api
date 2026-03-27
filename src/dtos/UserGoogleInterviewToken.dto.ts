export interface UserGoogleInterviewTokenDetailsApiDto {
  /**
   * GIS popup (Google Identity Services) authorization code.
   * This is exchanged on the backend for access/refresh tokens.
   *
   * @example "4/0AX4XfW..."
   */
  code: string;
}

export interface UserGoogleInterviewAccountDetailsDto {
  accessToken: string;
  refreshToken: string;
  expiryDate?: string;
  scope?: string;
}

export interface CreateUserGoogleInterviewTokenDetailsDto {
  userId: string;
  hasGoogleInterviewAccountDetails: UserGoogleInterviewAccountDetailsDto;
}

