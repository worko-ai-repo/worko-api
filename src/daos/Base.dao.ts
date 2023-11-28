class BaseDao {
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
}

export default BaseDao;
