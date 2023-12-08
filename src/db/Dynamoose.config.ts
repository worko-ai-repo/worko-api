import * as dynamoose from "dynamoose";
import DBConfig from "./DB.config";

/* import { UserModel } from "./models/User.model";
import { UserDetailModel } from "./models/UserDetail.model";
import { UserSubModel } from "./models/UserSubscription.model"; */

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
    accessKeyId: "dntwrl",
    secretAccessKey: "l3q7zk",
  },
  region: "local",
  endpoint: "http://localhost:8000",
});

// Set DynamoDB instance to the Dynamoose DDB instance
dynamoose.aws.ddb.set(ddb);

// dynamoose.aws.ddb.local();
const dbConfig = new DBConfig();
dbConfig.registerModels();
class DynamooseConfig {}

export default DynamooseConfig;

/* const WorkoTable = new dynamoose.Table("worko", [UserModel]);

const WorkoTable2 = new dynamoose.Table("worko", [UserDetailModel]);

const WorkoTable3 = new dynamoose.Table("worko", [UserSubModel]);

export { WorkoTable, WorkoTable2, WorkoTable3 }; */
