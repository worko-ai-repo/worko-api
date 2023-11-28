/* class BaseDao {
  // Constants related to User
  protected USER_CONSTANTS = {
    MODEL: "User",
    PK: "USR#EML#{primaryEmail}",
    // Sort key prefixes
    SK_ID: "ID#{uuid}",
    SK_ROLE: "ROLE#",
    SK_TYPE: "TYPE#",
    SK_SKILL: "SKILL#",
    SK_SUBS: "SUBS#CAND#ID#{subsId}",
    SK_EMAILS: "EMAILS#",
    SK_REFERRAL: "REF#ID#{reqId}",
  };

  protected COMPANY_CONSTANTS = {
    //company model
    MODEL: "Company",
    PK: "COMP#",
    SK_INIT: "ID#{companyId}",

    //company request model
    REQUEST_MODEL: "RequestCompany",
    REQUEST_PK: "RQST#COMP#",
    REQUEST_SK: "ID#{requestId}",
  };
}

export default BaseDao;
 */

/**
 * BaseDao
 *
 * This is BaseDao having the default structure for any bDTO we would creating.
 */
export default interface BaseDao {
  /**
   * modelName
   *
   * The model associated with this name would be used for performing the CRUD operations.
   * The model associated with this name would be used for performing the CRUD operations.
   * The model associated with this name would be used for performing the CRUD operations.
   */
  modelName: string;

  /**
   * partitianKey
   *
   * Partitian key from the DynamoDB
   */
  partitianKey: string;

  /**
   * sortKeys
   *
   * Example: {
   *  SK_ID: "ID#{uuid}",
   *  SK_ROLE: "ROLE#",
   * }
   */
  sortKeys: { [key: string]: string };
}
