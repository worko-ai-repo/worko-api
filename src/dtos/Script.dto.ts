

export interface ScriptPkAndSk {
  PK: string;
  SK: string;
}

/**
 * @reference 
 *    1. Check `scripToUpdateRegisteredUserGsiTwo`, `scripToRetryUpdateRegisteredUserGsiTwo` in `Script.service.ts`
 */
export interface ScriptPkAndSkWithCreatedAt extends ScriptPkAndSk {
  createdAt: string;
}