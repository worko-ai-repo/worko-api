//Load the base dao
import BaseDao from "./Base.dao";

//Load the local models
import { CompanyDetailModel } from "../db/models/CompanyDetail.model";

//Load the local dtos
import { CompanyDTO, CompanyListingFilterOptions } from "../dtos/Company.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Import necessary types from dynamoose library
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
      "logo",
      "isVerified",
    ];

    let query: Query<AnyItem>;
    query = CompanyDetailModel.query("PK").eq(this.partitianKey);

    // Construct the query based on filter options
    if (filterOptions.companyName) {
      // If company name filter is provided, construct a query to search for companies by name
      let companyName = filterOptions.companyName.toLocaleUpperCase();
      query = query.where("name").beginsWith(companyName);
      query = query.attributes(attributesToInclude);

      // Execute the query without pagination and return all the results for companyName
      return query.exec();
    }

    // If no company name filter is provided, check other filters
    if (filterOptions.industryName) {
      let industryName = filterOptions.industryName;
      // If industry name filter is provided, search for companies by industry
      query = query.where("industry").eq(industryName);
    }

    // Get TeamSize filter from filterOptions
    if (filterOptions.teamSize) {
      // If teamSize filter is provided, filter the companies by teamSize range
      let teamSizeRange = filterOptions.teamSize.split("-");
      if (teamSizeRange.length === 2) {
        // If range has two values, filter the companies within the range
        let minRange = parseInt(teamSizeRange[0]);
        let maxRange = parseInt(teamSizeRange[1]);
        query.where("teamSize").between(minRange, maxRange);
      } else if (teamSizeRange.length === 1) {
        // If range has only one value (single value), filter companies with teamSize equal to that value
        let singleTeamSize = parseInt(teamSizeRange[0]);
        query.where("teamSize").eq(singleTeamSize);
      }
    }

    // Include specified attributes in the query result
    query = query.attributes(attributesToInclude);

    // If any filter is applied, execute the query without pagination
    if (filterOptions.companyName || filterOptions.industryName || filterOptions.teamSize) {
      return query.exec();
    }

    // If no filter is applied, apply pagination
    if (filterOptions.lastKey) {
      // Start the query from the lastKey to retrieve subsequent pages
      query = query.startAt(filterOptions.lastKey);
    }

    // Execute the query with pagination
    return query.limit(filterOptions.pageSize).exec();
  }

  /**
   *
   * @param ids
   * Returns the list of companies having the InputKeys
   */
  getCompanyDetailsByIds(ids: string[]) {
    let inputKeys = ids.map((id) => {
      return {
        PK: this.partitianKey,
        SK: this.sortKeys.SK_INIT.strtr({
          "{companyId}": id,
        }),
      };
    });
    return CompanyDetailModel.batchGet(inputKeys);
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
      .contains(beginsWith.toUpperCase())
      .attributes(["name", "SK"])
      .exec();
  }

  async getAllCompanyNames() {
    return CompanyDetailModel.query("PK")
      .eq(this.partitianKey)
      .attributes(["name"])
      .exec();
  }

  /**
   *
   * Add a company based on provided DTO
   *
   * @param companyDto
   */
  async add(companyDto: CompanyDTO) {
    // Generate ULID id for company
    let id = UlidService.getUlidId();

    // Prepare the PK SK the company
    const SK = this.sortKeys.SK_INIT.strtr({
      "{companyId}": id,
    });

    companyDto.name = companyDto.name.toUpperCase();
    // Prepare the data required to create a new company
    const newCompanyDto = {
      PK: this.partitianKey,
      SK: SK,
      GSI1PK: this.GSI1PK.strtr({
        "{industryName}": companyDto.industry,
      }),
      GSI1SK: SK,
      id: id,
      ...companyDto,
    };

    // Create the company with the above data
    return CompanyDetailModel.create(newCompanyDto);
  }

  async update(companyDto: CompanyDTO, companyId: string) {
    const updateCompanyDto = {
      ...companyDto,
      id: companyId,    // adding id if its not present
    }
    // Update the company with the above data
    return CompanyDetailModel.update({
      PK: this.partitianKey,
      SK: this.sortKeys.SK_INIT.strtr({
        "{companyId}": companyId
      })
    }, updateCompanyDto);
  }
}

// Export an instance of the CompanyDetailDao class
const companyDetailDao = new CompanyDetailDao();

export default companyDetailDao;