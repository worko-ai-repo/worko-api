import { CompanyDetailModel } from "../db/models/CompanyDetail.model";
import { CompanyDTO } from "../dtos/Company.dto";
import UlidService from "../services/Ulid.service";
import BaseDao from "./Base.dao";

class CompanyDetailDao implements BaseDao {
  modelName = "Company";
  partitianKey = "COMP#";
  sortKeys = { SK_INIT: "ID#{companyId}" };

  "name": String;
  "industry": String;
  "teamSize": Number;
  "carrierPage": String;
  "linkedIn": String;
  "logoUrl": String;

  async add(companyDto: CompanyDTO) {
    try {
      companyDto.PK = this.partitianKey;
      // companyDto.SK = this.sortKeys.SK_INIT + UlidService.getUlidId();
      companyDto.SK = this.sortKeys.SK_INIT.replace(
        "{companyId}",
        UlidService.getUlidId()
      );
      console.log(companyDto);
      const res = await CompanyDetailModel.create(companyDto);
      console.log(res);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

// Export only the CompanyDao class
export default new CompanyDetailDao();
