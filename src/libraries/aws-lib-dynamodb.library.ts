// Import lib dynamodb library and types
import {
  PutCommand,
  DeleteCommand,
  QueryCommand,
  PutCommandOutput,
  DeleteCommandOutput,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";

// import DB config file to perform lib dynamodb operations
import { ddbDocClient } from "../db/DB.aws-lib-dynamodb.config";

/**
 * AWSLibDynamodbLibrary
 *
 * AWSLibDynamodbLibrary is a class that contains methods for interacting with DynamoDB in a more user-friendly way
 * 
 * NOTE: We need to add more DynamoDB Actions in `AWSLibDynamodbLibrary` like `BatchExecuteStatement`, `BatchGetItem`
 * `UpdateItem`,`BatchWriteItem` etc.., while we use lib dynamodb in the application
 * 
 * # Programming Amazon DynamoDB with JavaScript
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/programming-with-javascript.html
 *
 * # DynamoDB examples using SDK for JavaScript (v3)
 * @see https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html#actions
 */
class AWSLibDynamodbLibrary {
  /**
   * queryItems
   *
   * Retrieves items from a DynamoDB table using QueryCommand.
   *
   * @param {string} tableName - The name of the DynamoDB table to query.
   * @param {string} keyConditionExpression - The condition that specifies the key value(s) to query.
   * @param {Record<string, string>} expressionAttributeNames - A map of placeholders to their respective values.
   * @param {Record<string, any>} expressionAttributeValues - A map of placeholders to their respective values.
   * @returns {Promise<QueryCommandOutput>} - A promise that resolves to a QueryCommandOutput object containing the query results.
   */
  async queryItems(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>
  ): Promise<QueryCommandOutput> {
    global.logger.info(`queryItems: ${tableName}, ${keyConditionExpression}, ${expressionAttributeNames}, ${expressionAttributeValues}`,{
      filePath: __filename,
      methodName: this.queryItems.name
    });

    const queryCommand: QueryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    return ddbDocClient.send(queryCommand);
  }

  /**
   * putItem
   *
   * Adds a new item to a DynamoDB table using PutCommand.
   *
   * @param {string} tableName - The name of the DynamoDB table to add the item to.
   * @param {Record<string, any>} item - The details of the item to add.
   * @returns {Promise<PutCommandOutput>} - A promise that resolves to a PutCommandOutput object containing the result of the putItem operation.
   */
  async putItem(
    tableName: string,
    item: Record<string, any>
  ): Promise<PutCommandOutput> {
    global.logger.info(`putItem: ${tableName}, ${item}`,{
      filePath: __filename,
      methodName: this.putItem.name
    });

    const putCommand: PutCommand = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    return ddbDocClient.send(putCommand);
  }

  /**
   * deleteItem
   *
   * Deletes an item from a DynamoDB table using DeleteCommand.
   *
   * @param {string} tableName - The name of the DynamoDB table to delete the item from.
   * @param {Record<string, any>} key - The key of the item to delete.
   * @returns {Promise<DeleteCommandOutput>} - A promise that resolves to a DeleteCommandOutput object containing the result of the deleteItem operation.
   */
  async deleteItem(
    tableName: string,
    key: Record<string, any>
  ): Promise<DeleteCommandOutput> {
    global.logger.info(`deleteItem: ${tableName}, ${key}`,{
      filePath: __filename,
      methodName: this.deleteItem.name
    });

    const deleteCommand: DeleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    
    return ddbDocClient.send(
      deleteCommand
    );
  }
}

// Create an instance of AWSLibDynamodbLibrary
const awsLibDynamodbLibraryObj = new AWSLibDynamodbLibrary();

// Export the instance and class of AWSLibDynamodbLibrary
export { AWSLibDynamodbLibrary, awsLibDynamodbLibraryObj };