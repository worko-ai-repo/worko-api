// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User ProvidedService Database Data Transfer Object (DTO)
class DbUserProvidedServiceDto extends BaseDbDto {
  masterServiceId!: string;
  status!: string;
  serviceScope!: string[]; // Additional user scopes
  description!: string; // Max length 256
  durationAndPrices!: {
    priceId: string;
    durationInMinutes: number;
    rate: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  views?: {
    id: string;
    viewerUserId: string;
    ipAddress: string;
    createdAt?: Date;
  }[];
}

const ViewSchema = new dynamoose.Schema({
  view: {
    type: Object,
    schema: {
      id: String,
      viewerUserId: String,
      ipAddress: String,
      createdAt: Date,
    },
  },
});

const UserProvidedServiceSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    masterServiceId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      //enum: ["active"], // Should be 'active'
    },
    serviceScope: {
      type: Array, // Assuming serviceScope is an array and you want to ensure uniqueness
      schema: [String],
    },
    description: {
      type: String,
      required: true,
    },
    durationAndPrices: {
      type: Object,
      schema: {
        priceId: {
          type: String,
          required: true,
        },
        durationInMinutes: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        createdAt: {
          type: Date,
          required: false,
        },
        updatedAt: {
          type: Date,
          required: false,
        },
      },
    },
    views: {
      type: Array,
      required: false,
      schema: [ViewSchema],
    },
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
