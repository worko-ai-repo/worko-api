// Importing necessary packages/modules from npm
import { Item } from "dynamoose/dist/Item";

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

// Exports the necessary elements to be used externally
export { BaseDbDto };
