// Load the local daos
import companyJobUrlDao from "../daos/CompanyJobUrl.dao";

// Load the local dto

/**
 * CompanyService class responsible for managing company-related operations.
 */
class CompanyJobUrlService {
  constructor() {}
  /**
   *
   * @param jobUrl
   * @param companySK
   * @returns
   */
  async addCompanyRelatedJob(jobUrl: string, companySK: string) {
    console.log("Add a new company related JobUrl [Service]");
    return companyJobUrlDao.add(jobUrl, companySK);
  }

  /**
   *
   * @param jobUrl
   * @param companySK
   * @returns
   */
  async getJdUrl(jobUrl: string, companySK: string) {
    console.log("get JobUrl [Service]");
    return companyJobUrlDao.getJobUrl(jobUrl, companySK);
  }
}

// Export an instance of the CompanyService class
export default new CompanyJobUrlService();
