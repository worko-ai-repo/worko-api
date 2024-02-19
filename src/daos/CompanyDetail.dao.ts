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
      .attributes(["name", "SK" ])
      .exec();
  }

  /**
   *
   * Add a company based on provided DTO
   *
   * @param companyDto
   */
  async add(companyDto: CompanyDTO) {
    try {
      const newCompanyDto = {
        PK: this.partitianKey,
        SK: this.sortKeys.SK_INIT.strtr({
          "{companyId}": UlidService.getUlidId(),
        }),
        ...companyDto,
      };
      console.log(newCompanyDto); // Log the company DTO
      return CompanyDetailModel.create(newCompanyDto); // Create a new CompanyDetailModel entry
    } catch (error) {
      console.log(error); // Log any errors that occur during the process
      throw error; // Throw the error for handling at a higher level
    }
  }
}

// Export an instance of the CompanyDetailDao class
const companyDetailDao = new CompanyDetailDao();

export default companyDetailDao;
