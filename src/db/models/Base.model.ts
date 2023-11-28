//npm import
import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

//Local imports
import { DB_CONSTANTS } from "../DB.constants";

class Timestamps {
  "createdAt": String; //this will be taken care by dynamoose
  "updatedAt": String; //this will be taken care by dynamoose
}

class BaseDbDto extends Item {
  "PK": String;
  "SK": String;
  "timestamps": Timestamps;
}

const DBBaseSchema = new dynamoose.Schema(
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

class Model {
  /**
   *
   * @param modelName
   * @param schema
   * @returns
   */
  /* createDbModel(modelName: string, schema: any): any {
    const model = dynamoose.model(modelName, schema);
    const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
      model,
    ]);
    return model;
  } */

  /**
   *
   * @param model
   * @returns
   */
  registerModel(model: any): any {
    const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
      model,
    ]);
    return WorkoTable;
  }
}

const model = new Model();
export { BaseDbDto, DBBaseSchema, model };
