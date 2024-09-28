// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";

//Load the BaseDto
import { BaseDbDto } from "./Base.model";

//Load Enums
import {
    CompanyJobEmploymentTypeEnum,
    CompanyJobStatusEnum,
    CompanyJobWorkModeEnum
} from "../../enums/CompanyJob.enum";

//Load Interface
import { CompanyJobRangeDto } from "../../admin/dtos/CompanyJob.dto";

// Define the structure for User Support Database Data Transfer Object (DTO)
class DbCompanyJobDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    companyId!: string;
    createdByUserId!: string;
    updatedByUserId?: string;
    
    coreSkills!: string[];
    department!: string;
    experienceRange!: CompanyJobRangeDto;
    jobTitle!: string;
    jobDescription!: string;
    location!: string;
    mislaneiousSkills?: string[];
    noticePeriod!: number;
    numOfOpenings!: number;
    otherRequirements?: string;
    salaryRange!: CompanyJobRangeDto;
    softSkills!: string[];
    status!: CompanyJobStatusEnum;
    technicalSkills!: string[];
    typeofEmployment!: CompanyJobEmploymentTypeEnum;
    workMode!: CompanyJobWorkModeEnum;
    
    isDeleted!: boolean;
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
        coreSkills: {
            type: Array,
            schema: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        experienceRange: {
            type: Object,
            required: true,
            schema: {
                min: { type: Number, required: true },
                max: { type: Number, required: true }
            }
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        jobTitle: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        mislaneiousSkills: {
            type: Array,
            schema: String,
            required: false,
        },
        noticePeriod: {
            type: Number,
            required: true,
        },
        numOfOpenings: {
            type: Number,
            required: true,
        },
        otherRequirements: {
            type: String,
            required: false,
        },
        salaryRange: {
            type: Object,
            required: true,
            schema: {
                min: { type: Number, required: true },
                max: { type: Number, required: true }
            }
        },
        softSkills: {
            type: Array,  
            schema: String,
            required: true 
        },
        status: {
            type: String,
            required: true,
        },
        technicalSkills: {
            type: Array,
            schema: String,
            required: true,
        },
        typeofEmployment: {
            type: String,
            required: true,
        },
        workMode: {
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