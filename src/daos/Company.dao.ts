import * as dynamoose from "dynamoose";
import Worko from "../db/Dynamoose.config";
import { DB_CONSTANTS, DBSchema } from "../db/DB.constants";

// Common function to create a DynamoDB table with a model
// const createTableWithModel = (modelName, model, tableName) => {
//   const createdModel = dynamoose.model(modelName, model);
//   return new dynamoose.Table(tableName, [createdModel]);
// };

// Company related constants here
const COMPANY_CONSTANTS = {
  MODEL: "Company",
  PK: "COMPANY#",
  SK_INIT: "ID#",
  REQUEST_PK: "REQUEST#COMP#",
  REQUEST_MODEL: "RequestCompany",
};

// Strongly typed model
export class CompanyDao extends Worko {
  "name": String;
  "industry": String;
  "teamSize": Number;
  "carrierPage": String;
  "linkedIn": String;
  "logoUrl": String;
}

const CompanyModel = dynamoose.model(COMPANY_CONSTANTS.MODEL, [DBSchema]);
const Table = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  CompanyModel,
]);

const AddCompanyModel = dynamoose.model(COMPANY_CONSTANTS.REQUEST_MODEL, [
  DBSchema,
]);
const table2 = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  AddCompanyModel,
]);

export { CompanyModel, AddCompanyModel, COMPANY_CONSTANTS };

// import { DB_CONSTANTS, DBSchema } from "../db/DB.constants";
// import { CompanyDTO } from "../dtos/Company.dto";
// import * as dynamoose from "dynamoose";

// const CompanyModel = dynamoose.model(
//   DB_CONSTANTS.WORKO_TABLE_NAME,
//   DBSchema
// );

// class CompanyDAO {
//   static async createCompany(companyDTO: CompanyDTO): Promise<void> {
//     const newCompany = new CompanyModel({
//       PK: companyDTO.id,
//       SK: companyDTO.id,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       ...companyDTO,
//     });

//     await newCompany.save();
//   }

//   static async getCompanyById(companyId: string): Promise<CompanyDTO | null> {
//     const result = await CompanyModel.get({ PK: companyId, SK: companyId });

//     if (!result) {
//       return null;
//     }

//     return {
//       id: result.PK,
//       name: result.name,
//       industry: result.industry,
//       teamSize: result.teamSize,
//       carrierPage: result.carrierPage,
//       linkedIn: result.linkedIn,
//       logoUrl: result.logoUrl,
//       createdAt: result.createdAt,
//       updatedAt: result.updatedAt,
//     };
//   }

//   // Add other methods as needed (update, delete, query, etc.)
// }

// export { CompanyDAO };
