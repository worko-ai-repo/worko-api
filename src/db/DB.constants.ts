import * as dynamoose from "dynamoose";

const DB_CONSTANTS = {
  WORKO_TABLE_NAME: "worko",
  WORKO_PK_SK: {
    PK: { type: String, hashKey: true },
    SK: { type: String, rangeKey: true },
  },
  WORKO_MODEL_SCHEMA_OPTIONS: {
    create: false,
    waitForActive: false,
    saveUnknown: true,
  },
  WORKO_MODEL_TABLE_OPTIONS: {
    tableName: "worko",
  },
};

const DBSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    createdAt: {
      type: Date,
      default: new Date(),
      required: true,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);
export { DB_CONSTANTS, DBSchema };
