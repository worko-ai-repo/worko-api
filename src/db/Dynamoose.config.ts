import * as dynamoose from "dynamoose";

import { Item } from "dynamoose/dist/Item";

// Create new DynamoDB instance
// const ddb = new dynamoose.aws.ddb.DynamoDB({
//   credentials: {
//     accessKeyId: "REDACTED",
//     secretAccessKey: "REDACTED",
//   },
//   region: "local",
//   endpoint: "http://localhost:8000",
// });

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

class Timestamps {
  "createdAt": String; //this will be taken care by dynamoose
  "updatedAt": String; //this will be taken care by dynamoose
}

class Worko extends Item {
  "PK": String;
  "SK": String;
  "timestamps": Timestamps;
}

export default Worko;
