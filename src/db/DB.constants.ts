/**
 *
 * Constants related to the 'worko' database table, including table name, primary key and sort key definitions,
 * schema options, and table options for the worko model.
 *
 */
const DB_CONSTANTS = {
  WORKO_TABLE_NAME: "worko", // Defines the name of the 'worko' table in the database
  WORKO_PK_SK: {
    // Defines the primary key (PK) and sort key (SK) for the 'worko' table
    PK: { type: String, hashKey: true },
    SK: { type: String, rangeKey: true },
  },
  WORKO_MODEL_SCHEMA_OPTIONS: {
    // Schema options for the 'worko' model
    create: false,
    waitForActive: false,
    saveUnknown: true,
    timestamps: true,
  },
  WORKO_MODEL_TABLE_OPTIONS: {
    // Table options for the 'worko' model
    tableName: "worko",
  },
};

// Exports the DB_CONSTANTS object containing constants related to the 'worko' database table
export { DB_CONSTANTS };
