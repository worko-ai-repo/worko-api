/**
 *
 * Constants related to the 'worko' database table, including table name, primary key and sort key definitions,
 * schema options, and table options for the worko model.
 *
 */
const DB_CONSTANTS = {
  // Table names of worko
  WORKO_TABLE_NAMES: {
    workoTableName: "worko",
    workoCountTableName: "worko-count",
  },
  WORKO_PK_SK: {
    // Defines the primary key (PK) and sort key (SK) for the 'worko' table
    PK: { type: String, hashKey: true },
    SK: { type: String, rangeKey: true },
  },
  WORKO_MODEL_SCHEMA_OPTIONS: {
    // Schema options for the 'worko' model
    create: false,
    waitForActive: false,

    // @todo this should be false, because we should know what we are creating in the database.
    // When there is unknown field is being added then the dynamoose should through error.
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
