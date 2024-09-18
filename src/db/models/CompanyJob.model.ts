// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";

//Load the BaseDto
import { BaseDbDto } from "./Base.model";

//Load Enums
import { CompanyJobEmploymentTypeEnum, CompanyJobStatusEnum, CompanyJobWorkModeEnum } from "../../enums/CompanyJob.enum";

// Define the structure for User Support Database Data Transfer Object (DTO)
class DbCompanyJobDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    companyId!: string;
    createdByUserId!: string;
    updatedByUserId?: string;
    jobTitle!: string;
    jobDescription!: string;
    otherRequirements?: string;
    experienceRange!: number;
    noticePeriod!: number;
    numOfOpenings!: number;
    salaryRange!: number;
    department!: string;
    location!: string;
    workMode!: CompanyJobWorkModeEnum;
    typeofEmployment!: CompanyJobEmploymentTypeEnum;
    coreSkills!: string[];
    softSkills!: string[];
    technicalSkills!: string[];
    mislaneiousSkills?: string[];
    isDeleted!: boolean;
    status!: CompanyJobStatusEnum;
}

// Define the schema for the CompanyJob model
const CompanyJobSchema = new dynamoose.Schema(
    {
        ...DB_CONSTANTS.WORKO_PK_SK,
        GSI1PK: {
            type: String,
            index: {
                name: "GSI1",
                type: "global",
                rangeKey: "GSI1SK",
            },
            required: true
        },
        GSI1SK: {
            type: String,
            index: {
                name: "GSI1",
                type: "global",
            },
            required: true
        },
        id: {
            type: String,
            required: true,
        },
        companyId: {
            type: String,
            required: true,
        },
        createdByUserId: {
            type: String,
            required: true,
        },
        updatedByUserId: {
            type: String,
            required: false,
        },
        jobTitle: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        otherRequirements: {
            type: String,
            required: false,
        },
        experienceRange: {
            type: Number,
            required: true,
        },
        noticePeriod: {
            type: Number,
            required: true,
        },
        numOfOpenings: {
            type: Number,
            required: true,
        },
        salaryRange: {
            type: Number,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        workMode: {
            type: String,
            required: true,
        },
        typeofEmployment: {
            type: String,
            required: true,
        },
        coreSkills: {
            type: Array,
            schema: [String],
            required: true,
        },
        softSkills: {
            type: Array,
            schema: [String],
            required: true,
        },
        technicalSkills: {
            type: Array,
            schema: [String],
            required: true,
        },
        mislaneiousSkills: {
            type: Array,
            schema: [String],
            required: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
    }
);

// Create the Industry model using the schema
const CompanyJobModel = dynamoose.model<DbCompanyJobDto>(
    "CompanyJob", // Table name
    CompanyJobSchema // Table schema
);

// Export the SupportModel
export {
    CompanyJobModel,
    DbCompanyJobDto
};