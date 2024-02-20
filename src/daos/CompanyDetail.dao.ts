//Load the base dao
import BaseDao from "./Base.dao";

//Load the local models
import { CompanyDetailModel } from "../db/models/CompanyDetail.model";

//Load the local dtos
import { CompanyDTO, CompanyListingFilterOptions } from "../dtos/Company.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";
import { AnyItem } from "dynamoose/dist/Item";
import { Query } from "dynamoose/dist/ItemRetriever";

// DAO class for handling Company details
class CompanyDetailDao implements BaseDao {
  modelName = "Company"; // Model name for Company
  partitianKey = "COMP#"; // Partition key for Company
  sortKeys = { SK_INIT: "ID#{companyId}" }; // Sort keys for Company
  GSI1PK = "COMP#INDS#{industryName}";
  GSI1SK = "ID#{companyId}";

 /**
 * Retrieve a list of companies based on filter options, with pagination support.
 * @param filterOptions Filter options for querying companies.
 * @returns A list of companies based on the provided filter options.
 */
async companyList(filterOptions: CompanyListingFilterOptions) {
  console.log(filterOptions); // Log the filter options for debugging

  // Define attributes to include in the query result
  const attributesToInclude = [
    "GSI1PK",
    "GSI1SK",
    "name",
    "teamSize",
    "SK",
    "industry",
    "linkedIn",
    "logoUrl",
    "carrierPage",
  ];

  let query: Query<AnyItem>;

  // Construct the query based on filter options
  if (filterOptions.companyName) {
    // If company name filter is provided, construct a query to search for companies by name
    let companyName = filterOptions.companyName;
    // Convert the first letter to uppercase
    if (companyName[0] === companyName[0].toLowerCase()) {
      companyName =
        companyName.charAt(0).toUpperCase() + companyName.slice(1);
    }
    // Create a query to search for companies starting with the specified name
    query = CompanyDetailModel.query("PK")
      .eq(this.partitianKey)
      .where("name")
      .beginsWith(companyName);
  } else {
    // If no company name filter is provided, check other filters
    if (filterOptions.industryName) {
      // If industry name filter is provided, search for companies by industry
      query = CompanyDetailModel.query("GSI1PK").eq(
        this.GSI1PK.strtr({
          "{industryName}": filterOptions.industryName,
        })
      );
    } else {
      // If no specific filter is provided, retrieve all companies for the partition key
      query = CompanyDetailModel.query("PK").eq(this.partitianKey);
    }

    // Conditionally add filter for teamSize
    if (filterOptions.teamSize) {
      // If teamSize filter is provided, filter the companies by teamSize
      query.where("teamSize").eq(parseInt(filterOptions.teamSize));
    }
  }

  // Include specified attributes in the query result
  query = query.attributes(attributesToInclude);

  // If lastKey (offset) provided, start the query from the provided lastKey
  if (filterOptions.lastKey) {
    // Start the query from the lastKey to retrieve subsequent pages
    query = query.startAt(filterOptions.lastKey);
  }

  // Execute the query with pagination
  return query.limit(filterOptions.pageSize).exec();
}

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
