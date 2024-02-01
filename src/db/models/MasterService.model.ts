// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for Master Service Database Data Transfer Object (DTO)
class DbMasterServiceDto extends BaseDbDto {
  code!: string;
  name!: string;
  isActive!: boolean;
  details!: string;
  serviceScope!: string[];
}

const MasterServiceSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    serviceScope: {
      type: Array,
      required: true,
    },
    // Add other mater-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the MasterServiceModel using the defined schema
const MasterServiceModel = dynamoose.model<DbMasterServiceDto>(
  "MasterService",
  MasterServiceSchema
);

// Export the MasterService
export { MasterServiceModel };
