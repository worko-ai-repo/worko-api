// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User ProvidedService Database Data Transfer Object (DTO)
class DbUserProvidedServiceDto extends BaseDbDto {}

const UserProvidedServiceSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserProvidedServiceModel using the defined schema
const UserProvidedServiceModel = dynamoose.model<DbUserProvidedServiceDto>(
  "UserProvidedService",
  UserProvidedServiceSchema
);

// Export the UserProvidedServiceModel
export { UserProvidedServiceModel };
