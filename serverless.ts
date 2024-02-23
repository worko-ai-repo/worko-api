import type { AWS } from "@serverless/typescript";
import { request } from "express";

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
  custom: {},
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    stage: process.env.APP_SLS_STAGE,
    region: "ap-south-1", // Should be dynamically set
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        Resource: [
          "arn:aws:dynamodb:ap-south-1:*:table/worko",
          "arn:aws:dynamodb:ap-south-1:*:table/worko/index/GSI1",
        ]
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
          "rn:aws:lambda:ap-south-1:787066054733:function:worko-jd-resume-matching"
        ]
      }
    ],
    environment: {},
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
              arn: "arn:aws:lambda:ap-south-1:787066054733:function:worko-auth"
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
              arn: "arn:aws:lambda:ap-south-1:787066054733:function:worko-auth"
            }
          }
        },
      ],
    },
  },
  resources: {},
};

module.exports = serverlessConfiguration;