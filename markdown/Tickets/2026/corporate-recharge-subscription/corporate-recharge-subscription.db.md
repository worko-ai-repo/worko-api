
```ts
// corporateEntitySubsriptionWallets firestore collection
interface DbCorporateEntitySubsrciptionWalletDto {
   /**
    * @referenece "id" attribute of "CorporateUser.model.ts"
    */
   id: string;
   createdAt: string;
   updatedAt: string;


  corporateUserId: string;
  corporateUserEmail: string;

  entityType: "RECRUITER" | "EVALUATOR";

  /**
   * @description 
   *  1. total count of recruiters available to use by corporate-admin
   *  2. This "totalAvailableRecruiterCount" field will be available only when entityType: "EVALUATOR"
   */
  totalAvailableRecruiterCount?: number;

  /**
   * @description 
   *  1. count of lifetime recruiter usage
   *  2. This "totalUsedRecruiterCount" field will be available only when entityType: "EVALUATOR"
   */
  totalUsedRecruiterCount?: number;

  /**
   * @description 
   *  1. total count of recruiters available to use by corporate-admin
   *  2. This "totalAvailableEvaluatorCount" field will be available only when entityType: "EVALUATOR"
   */
  totalAvailableEvaluatorCount?: number;

  /**
   * @description 
   *  1. count of lifetime recruiter usage
   *  2. This "totalUsedEvaluatorCount" field will be available only when entityType: "EVALUATOR"
   */
  totalUsedEvaluatorCount?: number;

  /**
   * @description
   *  1. Lifetime amount paid by "corporate-admin"
   */
  totalAmountPaid: number;
}
```
