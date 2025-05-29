import * as crypto from "crypto";

//Load the base dao
import BaseDao from "./Base.dao";

//Load the local models
import { CompanyJobUrlModel } from "../db/models/CompanyJobUrl.model";

// DAO class for handling Company Jobs
class CompanyJobUrlDao implements BaseDao {
  modelName = "Company"; // Model name for Company
  partitianKey = "COMP#"; // Partition key for Company
  sortKeys = { SK_JOB: "ID#{companyId}#JOBURL#{md5JobUrl}" }; // Sort keys for Company Job

  /**
   *
   * @param jobUrl
   * @param companySK
   * @returns
   */
  async add(jobUrl: string, companySK: string) {
    console.log("Add a new company related JobUrl [DAO]");
    // Calculate MD5 hash of jobUrl
    const md5JobUrl = crypto.createHash("md5").update(jobUrl).digest("hex");

    const CompanyJobDto = {
      PK: this.partitianKey,
      SK: this.sortKeys.SK_JOB.strtr({
        "ID#{companyId}": companySK,
        "{md5JobUrl}": md5JobUrl,
      }),
      jobUrl: jobUrl,
    };
    console.log("CompanyJobDto: ", CompanyJobDto);
    return CompanyJobUrlModel.create(CompanyJobDto);
  }

  /**
   *
   * @param jobUrl
   * @param companySK
   * @returns
   */
  async getJobUrl(jobUrl: string, companySK: string) {
    console.log("get JobUrl [DAO]");
    // Calculate MD5 hash of jobUrl
    const md5JobUrl = crypto.createHash("md5").update(jobUrl).digest("hex");
    const PK = this.partitianKey;
    const SK = this.sortKeys.SK_JOB.strtr({
      "ID#{companyId}": companySK,
      "{md5JobUrl}": md5JobUrl,
    });
    return CompanyJobUrlModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }
}

// Export an instance of the CompanyJobDao class
const companyJobUrlDao = new CompanyJobUrlDao();

export default companyJobUrlDao;
