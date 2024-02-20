//Load the base dao
import BaseDao from "./Base.dao";

// Import DTOs
import { RecordListingFilterOptions } from "../dtos/Common.dto";

// Load the local model
import { CompanyModel } from "../db/models/Company.model";
import { CompanyListingFilterOptions } from "../dtos/Company.dto";
import { CompanyDetailModel } from "../db/models/CompanyDetail.model";

// Strongly typed model
class CompanyDao implements BaseDao {
  // Define properties for the CompanyDao class
  modelName = "Company"; // Define the model name
  partitianKey = "COMP#"; // Define the partition key
  sortKeys = {}; // Define sort keys (currently empty)
  GSI1PK = "COMP#INDS#{industryName}";

  /**
   * companyList
   *
   * Get the companies based on the provided filters.
   *
   * @param {CompanyListingFilterOptions} filterOptions The filter options for company listing
   * @returns {Promise<Array>} An array of companies
   */
  // async companyList(filterOptions: CompanyListingFilterOptions) {
  //   console.log(filterOptions);

  //   // Define attributes to include in the query result
  //   const attributesToInclude = [
  //     "GSI1PK",
  //     "GSI1SK",
  //     "name",
  //     "teamSize",
  //     "SK",
  //     "industry",
  //     "linkedIn",
  //     "logoUrl",
  //     "carrierPage",
  //   ];

  //   // Define the base query for CompanyModel
  //   let query = CompanyModel.query("PK")
  //     .eq(this.partitianKey)
  //     .attributes(attributesToInclude);

  //   // Define the base query for CompanyDetailModel
  //   let query2 = CompanyDetailModel.query("GSI1PK")
  //     .eq(
  //       this.GSI1PK.strtr({
  //         "{industryName}": filterOptions.industryName,
  //       })
  //     )
  //     .attributes(attributesToInclude);

  //   // If industryName is provided, execute query2
  //   if (filterOptions.industryName) {
  //     if (filterOptions.lastKey) {
  //       query2 = query2.startAt(filterOptions.lastKey);
  //     }
  //     return query2.limit(filterOptions.pageSize).exec();
  //   } else {
  //     // If only name provided, filter by name
  //     if (filterOptions.companyName) {
  //       let companyName = filterOptions.companyName;

  //       if (companyName[0] === companyName[0].toLowerCase()) {
  //         companyName =
  //           companyName.charAt(0).toUpperCase() + companyName.slice(1);
  //       }
  //       query.where("name").beginsWith(companyName);
  //     } else {
  //       // If teamSize provided, filter by teamSize
  //       if (filterOptions.teamSize) {
  //         const teamSizeNum = parseInt(filterOptions.teamSize);
  //         query = query.where("teamSize").eq(teamSizeNum);
  //       }
  //     }

  //     // If lastKey (offset) provided, start the query from the provided lastKey
  //     if (filterOptions.lastKey) {
  //       query = query.startAt(filterOptions.lastKey);
  //     }

  //     // Execute the query
  //     return query.limit(filterOptions.pageSize).exec();
  //   }
  // }
  //

  // Define method to get company by name
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

    return CompanyModel.query("PK")
      .eq(this.partitianKey)
      .where("name")
      .contains(name) // LIKE '{value}%'
      .attributes(attributesToInclude)
      .exec();
  }

  //

  // Define method to get company by teamSize
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
