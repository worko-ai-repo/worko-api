import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
    service: 'worko-api',
    frameworkVersion: '^3.30.1',
    package: {
        excludeDevDependencies: true,
    },
    plugins: [
        'serverless-offline'
    ],
    custom: {},
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        stage: "local",
        region: 'ap-south-1', // Should be dynamically set
        environment: {},
    },
    functions: {
        app: {
            handler: "dist/src/app.handler",
            events: [
                {
                    "http": "ANY /"
                },
                {
                    "http": "ANY /{proxy+}"
                },
            ]
        }
    },
    resources: {}
}

module.exports = serverlessConfiguration;