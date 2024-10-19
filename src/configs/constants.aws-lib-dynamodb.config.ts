/**
 * When you send data to DynamoDB using the DocumentClient, it automatically converts (or marshalls)
 * your regular JavaScript objects into DynamoDB's specific data format (AttributeValues).
 */
export interface marshallOptions {
  /**
   * Whether to automatically convert empty strings, blobs, and sets to `null`
   */
  convertEmptyValues?: boolean;

  /**
   * Whether to remove undefined values while marshalling.
   */
  removeUndefinedValues?: boolean;

  /**
   * Whether to convert typeof object to map attribute.
   */
  convertClassInstanceToMap?: boolean;

  /**
   * Whether to convert the top level container
   * if it is a map or list.
   *
   * Default is true when using the DynamoDBDocumentClient,
   * but false if directly using the marshall function (backwards compatibility).
   */
  convertTopLevelContainer?: boolean;
}

/**
 * When you retrieve data from DynamoDB using the DocumentClient, it automatically converts (or unmarshalls)
 * the data from DynamoDB's AttributeValue format back into regular JavaScript objects.
 */
export interface unmarshallOptions {
  /**
   * Whether to return numbers as a string instead of converting them to native JavaScript numbers.
   * This allows for the safe round-trip transport of numbers of arbitrary size.
   */
  wrapNumbers?: boolean;

  /**
   * When true, skip wrapping the data in `{ M: data }` before converting.
   *
   * Default is true when using the DynamoDBDocumentClient,
   * but false if directly using the unmarshall function (backwards compatibility).
   */
  convertWithoutMapWrapper?: boolean;
}

const marshallOptions: marshallOptions = {};
const unmarshallOptions: unmarshallOptions ={};
export const translateConfig = { 
  marshallOptions, unmarshallOptions
};