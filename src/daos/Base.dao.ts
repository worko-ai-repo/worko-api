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
