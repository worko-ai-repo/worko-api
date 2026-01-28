
export interface CreateReferralSourceTypeActivationApiDto {
  /**
   * @example "pankaj@amazon.com"
   */
  referralSourceTypeEmail: string;
  isEmailVerified: boolean;
}

export interface CreateReferralSourceTypeActivationDto {
  isEmailVerified: boolean;
  createdByCorporateUserId: string;
  createdByCorporateUserEmail: string;
  companyId: string;

  /**
   * @example "pankaj@amazon.com"
   */
  referralSourceTypeEmail: string;

  /**
   * @example
   *  1. "<companyId>@referral.worko.ai" on "prod" env
   *  2. "<companyId>@referral.worko.work" on "dev" env
   */
  systemReferralSourceTypeEmail: string;
}
