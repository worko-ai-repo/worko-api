//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { CompanyModel } from "../db/models/Company.model";

// Strongly typed model
class CompanyDao implements BaseDao {
  // Define properties for the CompanyDao class
  modelName = "Company"; // Define the model name
  partitianKey = "COMP#"; // Define the partition key
  sortKeys = {}; // Define sort keys (currently empty)

  /**
   * Fetches a list of companies
   *
   * @returns {Promise<Array>} An array of companies
   */
  async companyList() {
    try {
      // Define the attributes you want to include in the result
      const attributesToInclude = [
        "name",
        "teamSize",
        "SK",
        "industry",
        "linkedIn",
        "logoUrl",
        "carrierPage",
      ];
      // Queries the CompanyModel to retrieve companies based on the partition key
      return CompanyModel.query("PK")
        .eq(this.partitianKey)
        .attributes(attributesToInclude)
        .exec();
    } catch (error) {
      // Throws an error if there's an issue with the query
      throw error;
    }
  }
}

// Export only the CompanyDao class instance
const companyDao = new CompanyDao();

export default companyDao;
