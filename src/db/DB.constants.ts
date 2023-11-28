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

export { DB_CONSTANTS };
