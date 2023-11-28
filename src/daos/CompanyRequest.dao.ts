import { CompanyRequestModel } from "../db/models/CompanyRequest.model";
import { AddCompanyDTO } from "../dtos/Company.dto";
import UlidService from "../services/Ulid.service";
import BaseDao from "./Base.dao";

class CompanyRequestDao implements BaseDao {
  modelName = "RequestCompany";
  partitianKey = "RQST#COMP#";
  sortKeys = { REQUEST_SK: "ID#{requestId}" };

  "name": String;
  "industry": String;
  "teamSize": Number;
  "carrierPage": String;
  "linkedIn": String;
  "logoUrl": String;

  async requestedCompany() {
    try {
      return CompanyRequestModel.query("PK").eq(this.partitianKey).exec();
    } catch (error) {
      throw error;
    }
  }

  async request(addCompanyDto: AddCompanyDTO) {
    try {
      addCompanyDto.PK = this.partitianKey;
      addCompanyDto.SK = this.sortKeys.REQUEST_SK.replace(
        "{requestId}",
        UlidService.getUlidId()
      );
      return CompanyRequestModel.create(addCompanyDto);
    } catch (error) {
      throw error;
    }
  }
}

// Export only the CompanyDao class
export default new CompanyRequestDao();
