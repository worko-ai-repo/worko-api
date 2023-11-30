import * as dynamoose from "dynamoose";

// Create new DynamoDB instance
/* const ddb = new dynamoose.aws.ddb.DynamoDB({
  credentials: {
    accessKeyId: "REDACTED",
    secretAccessKey: "REDACTED",
  },
  region: "local",
  endpoint: "http://localhost:8000",
}); */

const ddb = new dynamoose.aws.ddb.DynamoDB({
  credentials: {
    accessKeyId: "xg5rz",
    secretAccessKey: "tfazj",
  },
  region: "local",
});

// Set DynamoDB instance to the Dynamoose DDB instance
dynamoose.aws.ddb.set(ddb);

// dynamoose.aws.ddb.local();
