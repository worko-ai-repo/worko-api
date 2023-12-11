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
  custom: {},
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    stage: process.env.APP_SLS_STAGE,
    region: "ap-south-1", // Should be dynamically set
    iamRoleStatements:[
      {
        Effect: "Allow",
        Action:[
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        Resource: "arn:aws:dynamodb:ap-south-1:*:table/worko",

      },{
        Effect: "Allow",
        Action:[
          "s3:PutObject",
				  "s3:GetObject",
				  "s3:ListBucket"
        ],
        Resource: [
          "arn:aws:s3:::worko-app-*",
          "arn:aws:s3:::*/*"
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
          http: "ANY /",
        },
        {
          http: "ANY /{proxy+}",
        },
      ],
    },
  },
  resources: {},
};

module.exports = serverlessConfiguration;
