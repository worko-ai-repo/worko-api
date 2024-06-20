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
    app: {
      STAGE: "${env:APP_SLS_STAGE}",
    },
    aws:{
      APP_AWS_ACCOUNT_ID:  "${env:APP_AWS_ACCOUNT_ID}",
      APP_AWS_DYNAMODB_TABLE_NAME: "${env:APP_AWS_DYNAMODB_TABLE_NAME}",
      APP_AWS_VPC:  "${env:APP_AWS_VPC}",
      APP_AWS_SECURITY_GROUP: "${env:APP_AWS_SECURITY_GROUP}",
      APP_AWS_SUBNET1: "${env:APP_AWS_SUBNET1}",
      APP_AWS_SUBNET2: "${env:APP_AWS_SUBNET2}"
    },
  },
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    stage: process.env.APP_SLS_STAGE, // @todo it is not being resolved, it needs to be fixed.
    environment:{
      
    },
    region: "ap-south-1", // Should be dynamically set
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
          "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:resume-parser"
        ]
      },{
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
      }
    ]
  },
  functions: {
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
  },
  resources: {},
};

module.exports = serverlessConfiguration;