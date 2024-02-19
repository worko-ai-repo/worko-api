//Load the base dao
import BaseDao from "./Base.dao";

// Import DTOs
import { RecordListingFilterOptions } from "../dtos/Common.dto";

// Load the local model
import { CompanyModel } from "../db/models/Company.model";
import { CompanyListingFilterOptions } from "../dtos/Company.dto";

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
  async companyList(filterOptions: CompanyListingFilterOptions) {
    console.log(filterOptions);

    // If only name provided
    if (filterOptions.companyName) {
      return this.getCompanyByName(filterOptions.companyName);
  }

  // If only teamSize provided
  // if (filterOptions.teamSize) {
  //   console.log(filterOptions.teamSize)
  //     return this.getCompanyByTeamSize(filterOptions.teamSize);
  // }
  
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

    let query = CompanyModel
      .query("PK")
      .eq(this.partitianKey);

    if (filterOptions.industryId) {
      query = 
        query
          .where("industry")
          .eq(filterOptions.industryId)
    }
    if (filterOptions.teamSize){
      const teamSizeNum = parseInt(filterOptions.teamSize);

      query = 
        query
          .where("teamSize")
          .eq(teamSizeNum)
    }

    // If "lastKey" (offset) is present then the records should be retrived after provided "lastKey".
    if (filterOptions.lastKey) {
      query = query.startAt(filterOptions.lastKey);
    }

    return query
      .limit(filterOptions.pageSize)
      .exec();
  }

  getCompanyByName(name: string) {
    const attributesToInclude = [
      "name",
      "teamSize",
      "SK",
      "industry",
      "linkedIn",
      "logoUrl",
      "carrierPage",
    ];

    return CompanyModel
      .query("PK")
      .eq(this.partitianKey)
      .where("name")
      .contains(name) // LIKE '{value}%'
      .attributes(attributesToInclude)
      .exec();
  }
  //
  
//   getCompanyByTeamSize(teamSize: string) {
//     const teamSizeNum = parseInt(filterOptions.teamSize);
   
//     const attributeToInclude = [
//         "name",
//         "teamSize",
//         "SK",
//         "industry",
//         "linkedIn",
//         "logoUrl",
//         "carrierPage",
//     ];

//     const query = CompanyModel
//         .query("PK")
//         .eq(this.partitianKey)
//         .where("teamSize")
//         .eq(teamSizeNum) 
//         .attributes(attributeToInclude);

    
//     console.log("Query Object:", query);

//     return query.exec();
// }


}

// Export only the CompanyDao class instance
const companyDao = new CompanyDao();

export default companyDao;