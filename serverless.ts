import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "worko-api",
  frameworkVersion: "^3.30.1",
  useDotenv: true,
  package: {
    excludeDevDependencies: true,
  },
  plugins: [
    "serverless-offline",
    "serverless-dotenv-plugin",
    "serverless-webpack",
  ],
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      packager: 'npm',
      includeModules: {
        forceExclude: [
          '@aws-sdk/client-cognito-identity-provider',
          '@aws-sdk/client-dynamodb',
          '@aws-sdk/client-lambda',
          '@aws-sdk/client-s3',
          '@aws-sdk/client-scheduler',
          '@aws-sdk/client-ses',
          '@aws-sdk/client-sqs',
          '@aws-sdk/lib-storage',
          '@aws-sdk/client-secrets-manager',
          '@aws-sdk/client-sns',
          '@aws-sdk/s3-request-presigner',
        ]
      }
    },
    app: {
      STAGE: "${env:APP_SLS_STAGE}",
    },
    aws: {
      APP_SLS_REGION: "${env:APP_SLS_REGION}",
      APP_AWS_ACCOUNT_ID: "${env:APP_AWS_ACCOUNT_ID}",
      APP_AWS_DYNAMODB_TABLE_NAME: "${env:APP_AWS_DYNAMODB_TABLE_NAME}",
      APP_AWS_VPC:  "${env:APP_AWS_VPC}",
      APP_AWS_SECURITY_GROUP: "${env:APP_AWS_SECURITY_GROUP}",
      APP_AWS_SUBNET1: "${env:APP_AWS_SUBNET1}",
      APP_AWS_SUBNET2: "${env:APP_AWS_SUBNET2}",
      APP_AWS_COGNITO_USER_POOL_ID: "${env:APP_AWS_COGNITO_USER_POOL_ID}",
      APP_AWS_RESUME_SIGNUP_SKILLS_PARSER_LAMBDA_NAME: "${env:APP_AWS_RESUME_SIGNUP_SKILLS_PARSER_LAMBDA_NAME}",
      APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET: "${env:APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET}",
      APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET: "${env:APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET}",
    },
    awsLambdaFunctions: {
      APP_AWS_SCHEDULER_HANDLER_LAMBDA_ARN: "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-api-${self:custom.app.STAGE}-app-scheduler-handler",
      APP_AWS_SCHEDULER_HANDLER_ROLE_ARN: "arn:aws:iam::${self:custom.aws.APP_AWS_ACCOUNT_ID}:role/worko-schedule-invoke-lambda-role",
    },
  },
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    stage: process.env.APP_SLS_STAGE, // @todo it is not being resolved, it needs to be fixed.
    environment: {
      APP_AWS_SCHEDULER_HANDLER_LAMBDA_ARN: "${self:custom.awsLambdaFunctions.APP_AWS_SCHEDULER_HANDLER_LAMBDA_ARN}",
      APP_AWS_SCHEDULER_HANDLER_ROLE_ARN: "${self:custom.awsLambdaFunctions.APP_AWS_SCHEDULER_HANDLER_ROLE_ARN}",
    },
    region: "ap-south-1", // Should be dynamically set

    /**
     * timeout
     * 
     * @see https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml#general-aws-lambda-settings
     * 
     * 1. Default timeout for functions. Optional. (default: 6 seconds).
     * 2. Note: API Gateway has a maximum timeout of 30 seconds
     */
    timeout: 900, 
    
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ],
        Resource: [
          "arn:aws:dynamodb:ap-south-1:*:table/worko",
          "arn:aws:dynamodb:ap-south-1:*:table/worko/index/GSI1",
          "arn:aws:dynamodb:ap-south-1:*:table/worko/index/GSI2",

          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-count",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-count/index/GSI1",
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "ses:SendEmail",
          "ses:GetContactList",
          "ses:SendCustomVerificationEmail",
          "ses:UpdateContactList",
          "ses:UpdateEmailTemplate",
          "ses:GetEmailIdentityPolicies",
          "ses:GetEmailTemplate",
          "ses:CreateEmailTemplate",
          "ses:SendBulkEmail",
          "ses:GetEmailIdentity",
          "ses:CreateTemplate",
          "ses:UpdateTemplate",
          "ses:GetTemplate",
          "ses:DeleteTemplate",
          "ses:SendTemplatedEmail",
          "ses:CreateTemplate"
        ],
        Resource: "*"
      },
      {
        Effect: "Allow",
        Action: [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource: [
          "arn:aws:s3:::worko-app-*",
          "arn:aws:s3:::*/*"
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "lambda:InvokeFunction",
          "lambda:InvokeAsync"
        ],
        Resource: [
          "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-jd-resume-matching",
          "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-resume-parser-${self:custom.app.STAGE}",
          "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-job-description-parser",
          "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:${self:custom.aws.APP_AWS_RESUME_SIGNUP_SKILLS_PARSER_LAMBDA_NAME}",
          "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-video-interview-workflow"
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "iam:PassRole",
          "scheduler:GetSchedule",
          "scheduler:UpdateSchedule",
          "scheduler:CreateSchedule",
          "scheduler:DeleteSchedule"
        ],
        Resource: [
          "arn:aws:iam::${self:custom.aws.APP_AWS_ACCOUNT_ID}:role/worko-schedule-invoke-lambda-role",
          "arn:aws:scheduler:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:schedule/*/*"
        ]
      },
      {
        Effect: "Allow",
        "Action": [
          "scheduler:GetScheduleGroup",
          "scheduler:DeleteScheduleGroup",
          "scheduler:CreateScheduleGroup"
        ],
        "Resource": "arn:aws:scheduler:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:schedule-group/*"
      },
      {
        Effect : "Allow",
        "Action": [
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminConfirmSignUp",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminListGroupsForUser",
        ],
        "Resource":"arn:aws:cognito-idp:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:userpool/${self:custom.aws.APP_AWS_COGNITO_USER_POOL_ID}"
      },

      /**
       * Example policies for Amazon SNS
       * @see https://docs.aws.amazon.com/sns/latest/dg/sns-using-identity-based-policies.html#sns-example-policies
       */
      {
        Effect: "Allow",
        Action: [
          "sns:Publish"
        ],

        /**
         * We want to send SMS to any mobile number, so we must set Resource to *.
         */
        Resource: "*", 
      },
      {
        "Effect": "Allow",
        "Action": [
            "secretsmanager:GetSecretValue",
        ],
       "Resource":[
          "arn:aws:secretsmanager:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:secret:${self:custom.aws.APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET}",
          "arn:aws:secretsmanager:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:secret:${self:custom.aws.APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET}"
        ] 
      }
    ]
  },
  functions: {
    app: {
      handler: "dist/src/app.handler",
      events: [
        {
          http: {
            path: "/",
            method: "ANY",
            cors: {
              origin: "*",
              headers: [
                "Content-Type",
                "X-Amz-Date",
                "Authorization",
                "X-Api-Key",
                "X-Amz-Security-Token",
                "X-Amz-User-Agent",
                "X-Amzn-Trace-Id"
              ],
              allowCredentials: false,
            },
            authorizer: {
              type: "request",
              arn: "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-auth"
            }
          }
        },
        {
          http: {
            path: "/{proxy+}",
            method: "ANY",
            cors: {
              origin: "*",
              headers: [
                "Content-Type",
                "X-Amz-Date",
                "Authorization",
                "X-Api-Key",
                "X-Amz-Security-Token",
                "X-Amz-User-Agent",
                "X-Amzn-Trace-Id"
              ],
              allowCredentials: false,
            },
            authorizer: {
              type: "request",
              arn: "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-auth"
            }
          }
        },
      ],
    },
    appeventtrigger:{
      handler: "dist/src/app-event-trigger.handler",
      events: [
        {
          sqs: {
            arn: "arn:aws:sqs:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:worko-app-event-queue",
            batchSize: 1,
            maximumBatchingWindow: 0
          }
        }
      ]
    },
    "app-scheduler-handler": {
      handler: "dist/src/app-scheduler.handler",
    },
  },
  resources: {},
};

module.exports = serverlessConfiguration;