//Load the base dao
import BaseDao from "./Base.dao";

//Load the local models
import { CompanyDetailModel } from "../db/models/CompanyDetail.model";

//Load the local dtos
import { CompanyDTO } from "../dtos/Company.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// DAO class for handling Company details
class CompanyDetailDao implements BaseDao {
  modelName = "Company"; // Model name for Company
  partitianKey = "COMP#"; // Partition key for Company
  sortKeys = { SK_INIT: "ID#{companyId}" }; // Sort keys for Company
  GSI1PK = "COMP#INDS#{industryName}";
  GSI1SK = "ID#{companyId}";

  /**
   *
   * Get a list of specific company name and SK
   *
   * @param beginsWith
   */
  async getByBeginsith(beginsWith: string) {
    return CompanyDetailModel.query("PK")
      .eq(this.partitianKey)
      .where("name")
      .beginsWith(beginsWith)
      .attributes(["name", "SK"])
      .exec();
  }

  /**
   *
   * Add a company based on provided DTO
   *
   * @param companyDto
   */
  async add(companyDto: CompanyDTO) {
    const SK = this.sortKeys.SK_INIT.strtr({
      "{companyId}": UlidService.getUlidId(),
    });
    const newCompanyDto = {
      PK: this.partitianKey,
      SK: SK,
      GSI1PK: this.GSI1PK.strtr({
        "{industryName}": companyDto.industry,
      }),
      GSI1SK: SK,
      ...companyDto,
    };
    return CompanyDetailModel.create(newCompanyDto); // Create a new CompanyDetailModel entry
  }
}

// Export an instance of the CompanyDetailDao class
const companyDetailDao = new CompanyDetailDao();

export default companyDetailDao;
