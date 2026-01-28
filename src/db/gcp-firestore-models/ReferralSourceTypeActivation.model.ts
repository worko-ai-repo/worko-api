
// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbReferralSourceTypeActivationDto extends BaseFirestoreModel {
  companyId: string;
  createdByCorporateUserId: string;
  updatedByCorporateUserId?: string;
  createdByCorporateUserEmail: string;

  /**
   * @description
   *  1. Whenever "corporate-admin" submits "referralSourceTypeEmail" then
   *  we will send otp to this email address and then Frontend will send this attribute to Backend as true
   * @example true
   */
  isEmailVerified: boolean;

  /**
   * @description
   *  1. This email will be submitted by "corporate-admin"
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

export { DbReferralSourceTypeActivationDto };