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
    timestamps: true,
  },
  WORKO_MODEL_TABLE_OPTIONS: {
    tableName: "worko",
  },
  COMPANY_MODEL: "Company",
  COMPANY_PK: "COMPANY#",
  COMPANY_SK_INIT: "ID#",
};

export default DB_CONSTANTS;
