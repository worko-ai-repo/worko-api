// Importing necessary packages/modules from npm
import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

//Load local DBconstants
import { DB_CONSTANTS } from "../DB.constants";

// Represents the structure for timestamps
class Timestamps {
  "createdAt": String; // Dynamoose will handle this field
  "updatedAt": String; // Dynamoose will handle this field
}

// Represents the base structure for the database DTO (Data Transfer Object)
class BaseDbDto extends Item {
  "PK": String;
  "SK": String;
  "timestamps": Timestamps; // Includes timestamps structure
}

// Represents the Database Model
class DbModel {
  constructor() {
    console.log(" -> DbModel called <- ");
  }

  /**
   * Registers a model in the database
   * @param model - The model to be registered
   * @returns The registered WorkoTable
   */
  registerModel(model: any): any {
    const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
      model,
    ]);
    return WorkoTable;
  }
}

// Instantiates the DbModel class
const dbModel = new DbModel();

// Exports the necessary elements to be used externally
export { BaseDbDto, dbModel };
