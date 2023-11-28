import * as dynamoose from "dynamoose";

// Local
import { DB_CONSTANTS } from "../DB.constants";
import { DBBaseSchema } from "./Base.model";
import { model, BaseDbDto } from "./Base.model";

class CompanyDetailsDbDto extends BaseDbDto {
  name!: string;
  industry!: string;
  teamSize!: number;
  carrierPage!: string;
  linkedIn!: string;
  logoUrl!: string;
}

const CompanySchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes,
    name: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    teamSize: {
      type: Number,
      required: true,
    },
    carrierPage: {
      type: String,
      required: true,
    },
    linkedIn: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const CompanyDetailModel = dynamoose.model<CompanyDetailsDbDto>(
  "CompanyDetail",
  CompanySchema
);
model.registerModel(CompanyDetailModel);

export { CompanyDetailModel };
