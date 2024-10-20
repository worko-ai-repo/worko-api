// import dynamoose
import * as dynamoose from "dynamoose";

//import constants
import { DB_CONSTANTS } from "../DB.constants";

// import models
import { BaseDbDto } from "./Base.model";

// import enums
import { UserContextTypeEnum } from "../../enums/User.enum";

// import dtos
import { GrowaasanPlaceholderParamDto } from "../../dtos/GrowaasanTemplatePlaceholder.dto";
import { GrowaasanPhoneNumberDto, GrowaasanSendMessageResponseDto } from "../../dtos/Growaasan.dto";

// Define the DbGrowaasanMessageLogDto class for DynamoDB
class DbGrowaasanMessageLogDto extends BaseDbDto {
  id!: string;
  GSI1PK!: string;
  GSI1SK!: string;
  userId!: string;
  growaasanMessageId?: string;
  templateName!: string;
  status?: string;
  fromPhoneNumber!: GrowaasanPhoneNumberDto;
  toPhoneNumber!: GrowaasanPhoneNumberDto;
  templatePlaceholders!: GrowaasanPlaceholderParamDto;
  contextType?: UserContextTypeEnum;
  contextId?: string;
  createdByUserId!: string;
  growaasanSendMessageResponse?: GrowaasanSendMessageResponseDto;
}

// Define the GrowaasanMessageLogSchema for DynamoDB
const GrowaasanMessageLogSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: {
      type: String,
      required: true,
    },
    GSI1PK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
        rangeKey: "GSI1SK",
      },
      required: true,
    },
    GSI1SK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
      },
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    growaasanMessageId: {
      type: String,
      required: false,
    },
    templateName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
    },
    fromPhoneNumber: {
      type: Object,
      required: true,
    },
    toPhoneNumber: {
      type: Object,
      required: true,
    },  
    templatePlaceholders: {
      type: Object,
      required: true,
    },
    contextType: {
      type: String,
      required: false,
    },
    contextId: {
      type: String,
      required: false,
    },
    createdByUserId: {
      type: String,
      required: true,
    },
    growaasanSendMessageResponse: {
      type: Object,
      required: false,
    }
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Define the GrowaasanMessageLogModel
const GrowaasanMessageLogModel = dynamoose.model<DbGrowaasanMessageLogDto>(
  "GrowaasanMessageLog",
  GrowaasanMessageLogSchema
);

// Export the DbGrowaasanMessageLogDto and the GrowaasanMessageLogModel for use in other files
export { GrowaasanMessageLogModel, DbGrowaasanMessageLogDto };