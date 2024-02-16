//Load the base dao
import BaseDao from "./Base.dao";

// Import DTOs
import { RecordListingFilterOptions } from "../dtos/Common.dto";

// Load the local model
import { CompanyModel } from "../db/models/Company.model";

// Strongly typed model
class CompanyDao implements BaseDao {
  // Define properties for the CompanyDao class
  modelName = "Company"; // Define the model name
  partitianKey = "COMP#"; // Define the partition key
  sortKeys = {}; // Define sort keys (currently empty)

  /**
   * companyList
   *
   * Get the companies based on the provided filters.
   *
   * @param {RecordListingFilterOptions} filterOptions
   * @returns {Promise<Array>} An array of companies
   */
  async companyList(filterOptions: RecordListingFilterOptions) {
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

    // Get "query" reference for the operation
    let query = CompanyModel.query("PK")
      .eq(this.partitianKey)
      .attributes(attributesToInclude);

    // If "lastKey" (offset) is present then the records should be retrived after provided "lastKey".
    if (filterOptions.lastKey) {
      query = query.startAt(filterOptions.lastKey);
    }

    return query.limit(filterOptions.pageSize).exec();
  }
}

// Export only the CompanyDao class instance
const companyDao = new CompanyDao();

export default companyDao;
