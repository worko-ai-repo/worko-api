// NPM Packages
import type { S3ClientConfig } from "@aws-sdk/client-s3";
import type { SESClientConfig } from "@aws-sdk/client-ses";
import type { SQSClientConfig } from "@aws-sdk/client-sqs";
import type { SchedulerClientConfig } from "@aws-sdk/client-scheduler";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

// Import configs
import APP_CONSTANTS from "./constants.config";

// Import libraries
import { AwsS3ClientLibrary } from "../libraries/aws-s3-client.library";
import { AwsSesClientLibrary } from "../libraries/aws-ses-client.library";
import { AwsSqsClientLibrary } from "../libraries/aws-sqs-client.library";
import { AwsSchedulerLibrary } from "../libraries/aws-scheduler-client.library";
import { AwsDynamoDBLibrary } from "../libraries/aws-dynamoDb-client.library"; 
import { AwsClientSnsLibrary } from "../libraries/aws-client-sns.library";
import { AwsClientCognitoIdentityProviderLibrary } from "../libraries/aws-client-cognito-identity-provider.library";
import { AwsClientLambdaLibrary } from "../libraries/aws-client-lambda.library";
import { AwsClientSecretsManagerLibrary } from "../libraries/aws-client-secrets-manager.libary";
/**
 * getAwsConfig
 * 
 * Generic configurations for AWS SDK v3 services.
 */
const getAwsConfig = () => ({
    credentials: process.env.APP_STAGE == APP_CONSTANTS.STAGES.LOCAL ? {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.APP_AWS_SESSION_TOKEN,
    } : undefined,
    region: process.env.APP_AWS_REGION,
});

/**
 * ****************************************************************************************************
 * AWS S3 Client Library
 * ****************************************************************************************************
 */

/**
 * awsS3ConfigOptions
 * 
 * AWS S3 specific configurations extending the "awsConfigOptions".
 */
const awsS3ConfigOptions: S3ClientConfig = getAwsConfig();

/**
 * awsS3ClientLibrary
 * 
 * Application/local S3 wrapper client to interact with AWS S3 service to perform regular activities
 */
const awsS3ClientLibrary: AwsS3ClientLibrary = new AwsS3ClientLibrary(awsS3ConfigOptions);
console.log("The 'awsS3ClientLibrary' is initialised.", { filePath: __filename, });

/**
 * ****************************************************************************************************
 * AWS SES Client Library
 * ****************************************************************************************************
 */

/**
 * awsSesConfigOptions
 * 
 * AWS SES specific configurations extending the "awsConfigOptions".
 */
const awsSesConfigOptions: SESClientConfig = getAwsConfig();

/**
 * awsSesClientLibrary
 * 
 * Application/local SES wrapper client to interact with AWS SES service to perform regular activities
 */
const awsSesClientLibrary: AwsSesClientLibrary = new AwsSesClientLibrary(awsSesConfigOptions);
console.log("The 'awsSesClientLibrary' is initialised.", { filePath: __filename, });

/**
 * ****************************************************************************************************
 * AWS SQS Client Library
 * ****************************************************************************************************
 */

/**
 * awsSqsConfigOptions
 * 
 * AWS SQS specific configurations extending the "awsConfigOptions".
 */
const awsSqsConfigOptions: SQSClientConfig = getAwsConfig();

/**
 * awsSqsClientLibrary
 * 
 * Application/local SQS wrapper client to interact with AWS SQS service to perform regular activities
 */
const awsSqsClientLibrary: AwsSqsClientLibrary = new AwsSqsClientLibrary(awsSqsConfigOptions);
console.log("The 'awsSqsClientLibrary' is initialised.", { filePath: __filename, });

/**
 * ****************************************************************************************************
 * AWS Scheduler Client Library
 * ****************************************************************************************************
 */

/**
 * awsSchedulerConfigOptions
 * 
 * AWS Scheduler specific configurations extending the "awsConfigOptions".
 */
const awsSchedulerConfigOptions: SchedulerClientConfig = getAwsConfig();

/**
 * awsSchedulerClientLibrary
 * 
 * Application/local Scheduler wrapper client to interact with AWS Scheduler service to perform regular activities
 */
const awsSchedulerClientLibrary: AwsSchedulerLibrary = new AwsSchedulerLibrary(awsSchedulerConfigOptions);
console.log("The 'awsSchedulerClientLibrary' is initialised.", { filePath: __filename, });

// ****************************************************************************************************
// AWS DynamoDB Client Library
// ****************************************************************************************************

/**
 * awsDynamoDBConfigOptions
 * 
 * AWS DynamoDB specific configurations.
 */
const awsDynamoDBConfigOptions: DynamoDBClientConfig = getAwsConfig();

/**
 * awsDynamoDBClientLibrary
 * 
 * Application/local DynamoDB wrapper client to interact with AWS DynamoDB service to perform regular activities
 */
const awsDynamoDBClientLibrary: AwsDynamoDBLibrary = new AwsDynamoDBLibrary(awsDynamoDBConfigOptions);
console.log("The 'awsDynamoDBClientLibrary' is initialised.", { filePath: __filename, });

const awsClientSnsLibrary: AwsClientSnsLibrary = new AwsClientSnsLibrary();
global.logger.info("The 'AwsClientSnsLibrary' is initialised.");

/**
 * awsClientCognitoIdentityProviderLibrary
 * 
 * NOTE: For this client, the `aws-sdk v3` is used
 */
const awsClientCognitoIdentityProviderLibrary: AwsClientCognitoIdentityProviderLibrary = new AwsClientCognitoIdentityProviderLibrary();
global.logger.info(`The "awsClientCognitoIdentityProviderLibrary" is initialised.`);


const awsClientLambdaLibrary: AwsClientLambdaLibrary = new AwsClientLambdaLibrary();
global.logger.info(`The "awsClientLambdaLibrary" is initialised.`);

/**
 * awsClientSecretsManagerLibrary
 * 
 * NOTE: For this client secrets manager, the `aws-sdk v3` is used
 */
const awsClientSecretsManagerLibrary: AwsClientSecretsManagerLibrary = new AwsClientSecretsManagerLibrary();
global.logger.info(`The "awsClientSecretsManagerLibrary" is initialised.`);


// Export the required resourses
export {
    awsS3ConfigOptions,
    awsSesConfigOptions,
    awsSqsConfigOptions,
    awsSchedulerConfigOptions,
    awsDynamoDBConfigOptions,
    awsS3ClientLibrary,
    awsSesClientLibrary,
    awsSqsClientLibrary,
    awsSchedulerClientLibrary,
    awsDynamoDBClientLibrary,
    awsClientSnsLibrary,
    awsClientCognitoIdentityProviderLibrary,
    awsClientLambdaLibrary,
    awsClientSecretsManagerLibrary
}