// /**
//  * First You need to understand What's the AWS SDK for JavaScript?
//  * @see https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html
//  *
//  * OVERALL SETUP of lib dynamodb:-
//  * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-dynamodb/
//  *
//  * Programming Amazon DynamoDB with JavaScript
//  * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/programming-with-javascript.html
//  */

// /**
//  * Bare-bones DynamoDB Client
//  *
//  * The bare-bones clients are more modular. They reduce bundle size and improve loading performance over full clients
//  * as explained in blog post on @see https://aws.amazon.com/blogs/developer/modular-packages-in-aws-sdk-for-javascript/
//  */
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// /**
//  * `DynamoDBDocumentClient` is a higher-level abstraction for working with DynamoDB in the AWS SDK for JavaScript v3.
//  * It simplifies interactions with DynamoDB by providing a more user-friendly API for performing operations such as
//  * reading and writing items.
//  *
//  * This client automatically handles the conversion between the DynamoDB format and JavaScript objects,
//  * making it easier to work with DynamoDB's data model.
//  */
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// // import configs
// import { translateConfig } from "../configs/constants.aws-lib-dynamodb.config";
// import APP_CONSTANTS from "../configs/constants.config";

// /**
//  * DbAwsLibDynamodbConfig Class
//  *
//  * This class sets up the DynamoDBClient and DynamoDBDocumentClient based on the environment configuration.
//  * It provides methods to interact with DynamoDB in a user-friendly way using the DynamoDBDocumentClient.
//  */
// export class DbAwsLibDynamodbConfig {
//   private static dynamoDBClient: DynamoDBClient;
//   public static ddbDocClient: DynamoDBDocumentClient;

//   /**
//    * Initialize the DbAwsLibDynamodbConfig class.
//    * It sets up the configuration based on the environment and initializes the clients.
//    */
//   public static init() {
//     let config = {};

//     // If the stage is local, connect to the local DynamoDB instance
//     if (process.env.APP_STAGE === APP_CONSTANTS.STAGES.LOCAL) {
//       global.logger.info(
//         "connecting to local DynamoDB instance using lib-dynamodb",
//         {
//           filePath: __filename,
//           methodName: this.init.name,
//         }
//       );

//       config = {
//         credentials: {
//           accessKeyId: process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID as string,
//           secretAccessKey: process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY as string,
//         },
//         region: process.env.APP_SLS_REGION,
//         endpoint: process.env.APP_AWS_DYNAMODB_NOSQL_WORKBENCH_ENDPOINT,
//       };
//     }
//     // For other stages, use the region provided in the environment variables
//     else {
//       global.logger.info(
//         "connecting to remote DynamoDB instance using lib-dynamodb",
//         {
//           filePath: __filename,
//           methodName: this.init.name,
//         }
//       );

//       config = {
//         region: process.env.APP_SLS_REGION,
//       };
//     }

//     // Create a new instance of DynamoDBClient with the specified configuration settings.
//     this.dynamoDBClient = new DynamoDBClient(config);

//     /**
//      * Create a new instance of DynamoDBDocumentClient using the DynamoDBClient instance.
//      *
//      * The `translateConfig` parameter is used to specify configuration options for translating between
//      * DynamoDB and JavaScript objects, such as converting data types and handling attribute names.
//      */
//     this.ddbDocClient = DynamoDBDocumentClient.from(
//       this.dynamoDBClient,
//       translateConfig
//     );
//   }
// }

// // Initialize the DbAwsLibDynamodbConfig
// DbAwsLibDynamodbConfig.init();

// /**
//  * The `ddbDocClient` that you exported is used for interacting with DynamoDB in a more user-friendly way,
//  * by abstracting away the lower-level complexities of the native DynamoDB client.
//  *
//  * The DynamoDBDocumentClient simplifies working with DynamoDB by handling data conversion and
//  * serialization automatically.
//  *
//  * You can use the `ddbDocClient` to perform basic operations, such as put, get, update, delete
//  *
//  * Below docs is used to understand how to interact with DynamoDB using `ddbDocClient`
//  * @see https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-dynamodb-utilities.html
//  */
// export const { ddbDocClient } = DbAwsLibDynamodbConfig;