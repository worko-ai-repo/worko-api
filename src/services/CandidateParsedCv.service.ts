// Import firestore package
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";

// Import enums
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

// Import helpers
import { getPhoneCountryCodeAndNumber } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbUserSkillDto } from "../db/models/UserSkill.model";
import { DbUserPreferenceDto } from "../db/models/UserPreference.model";

// Import services
import UserDetailService from "./UserDetail.service";
import UserSkillService from "./UserSkill.service";
import { userPreferenceServiceObj } from "./UserPreference.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CandidateParsedCvService {
  /**
   * Formats a list of skills into a string with the given label.
   * If the skills list is empty, an empty string is returned.
   * @param {object[]} skills - List of skills objects with skillName and years properties.
   * @param {string} label - Label to be prepended to the formatted skills string.
   * @returns {string} - Formatted string with the given label and skills list.
   */
  private formatSkillsList(skills: { skillName: string; years: number }[], label: string): string {
    if (!skills?.length) return "";
    const skillsText: string = skills.map(skill => `${skill.skillName} (${skill.years} years)`).join(", ");
    return `${label}: ${skillsText}`;
  }

  /**
   * Formats a list of strings into a string with the given label.
   * If the items list is empty, an empty string is returned.
   * @param {string[]} items - List of strings to be formatted.
   * @param {string} label - Label to be prepended to the formatted items string.
   * @returns {string} - Formatted string with the given label and items list.
   */
  private formatStringArray(items: string[], label: string): string {
    if (!items?.length) return "";
    return `${label}: ${items.join(", ")}`;
  }

  private createSearchOptimizedCandidateParsedCvEmbeddingText(createData: DbCandidateParsedCvDto): string {
    const embeddingParts: string[] = [];

    if (createData.companyId) {
      embeddingParts.push(`Company ID: ${createData.companyId}`);
    }

    if (createData.currentCompany) {
      embeddingParts.push(`Current Company: ${createData.currentCompany}`);
    }

    if (createData.currentDesignation) {
      embeddingParts.push(`Current Designation: ${createData.currentDesignation}`);
    }

    if (createData.totalYOE) {
      embeddingParts.push(`Total Experience: ${createData.totalYOE} years`);
    }

    if (createData.relevantYOE) {
      embeddingParts.push(`Relevant Experience: ${createData.relevantYOE} years`);
    }

    if (createData.currentCTC) {
      embeddingParts.push(`Current CTC: ${createData.currentCTC} LPA`);
    }

    if (createData.expectedCTC) {
      embeddingParts.push(`Expected CTC: ${createData.expectedCTC} LPA`);
    }

    if (createData.noticePeriod) {
      embeddingParts.push(`Notice Period: ${createData.noticePeriod} days`);
    }

    if (createData.isNoticePeriodNegotiable) {
      const negotiable: "Yes" | "No" = createData.isNoticePeriodNegotiable ? "Yes" : "No";
      embeddingParts.push(`Notice Period Negotiable: ${negotiable}`);
    }

    if (createData.location) {
      embeddingParts.push(`Current Location: ${createData.location}`);
    }

    if (createData.readyToRelocate) {
      const relocate: "Yes" | "No" = createData.readyToRelocate ? "Yes" : "No";
      embeddingParts.push(`Ready to Relocate: ${relocate}`);
    }

    if (createData.coreSkills) {
      const coreSkillsText: string = this.formatSkillsList(createData.coreSkills, "Core Skills");
      if (coreSkillsText) {
        embeddingParts.push(coreSkillsText);
      }
    }

    if (createData.technicalSkills) {
      const techSkillsText: string = this.formatSkillsList(createData.technicalSkills, "Technical Skills");
      if (techSkillsText) {
        embeddingParts.push(techSkillsText);
      }
    }

    if (createData.userPreferredDepartments) {
      const deptText: string = this.formatStringArray(createData.userPreferredDepartments, "Preferred Departments");
      if (deptText) {
        embeddingParts.push(deptText);
      }
    }

    if (createData.userPreferredIndustries) {
      const industryText: string = this.formatStringArray(createData.userPreferredIndustries, "Preferred Industries");
      if (industryText) {
        embeddingParts.push(industryText);
      }
    }

    if (createData.userPreferredRoles) {
      const rolesText: string = this.formatStringArray(createData.userPreferredRoles, "Preferred Roles");
      if (rolesText) {
        embeddingParts.push(rolesText);
      }
    }

    if (createData.userPreferredlocations) {
      const locationsText: string = this.formatStringArray(createData.userPreferredlocations, "Preferred Locations");
      if (locationsText) {
        embeddingParts.push(locationsText);
      }
    }

    return embeddingParts.join(" | ");
  }

  async createCandidateParsedCvWithEmbedding(
    createData: DbCandidateParsedCvDto
  ): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Create Candidate Parsed CV [Service]`, {
      methodName: this.createCandidateParsedCvWithEmbedding.name,
    });

    const embeddingText: string = this.createSearchOptimizedCandidateParsedCvEmbeddingText(createData);

    return candidateParsedCvDaoObj.createCandidateParsedCvWithEmbedding(
      createData,
      embeddingText
    );
  }

  async createCandidateParsedCv(createData: DbCandidateParsedCvDto): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Create Candidate Parsed CV [Service]`, {
      methodName: this.createCandidateParsedCv.name,
    });

    return candidateParsedCvDaoObj.createCandidateParsedCv(createData);
  }

  async getCandidateParsedCvById(id: string): Promise<DbCandidateParsedCvDto | undefined> {
    return candidateParsedCvDaoObj.getCandidateParsedCvById(id);
  }

  async getCandidateParsedCvByCompIdAndCandEmail(
    companyId: string,
    candidateEmail: string
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    return candidateParsedCvDaoObj.getCandidateParsedCvByCompIdAndCandEmail(
      companyId,
      candidateEmail
    );
  }

  async updateCandidateParsedCvWithEmbedding(
    id: string,
    updateData: Partial<DbCandidateParsedCvDto>
  ): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Update Candidate Parsed CV with Embedding [Service]`, {
      methodName: this.updateCandidateParsedCvWithEmbedding.name,
    });

    const existingData: DbCandidateParsedCvDto | undefined = await candidateParsedCvDaoObj.getCandidateParsedCvById(id);
    if (!existingData) {
      throw new BaseError(
        "Candidate Parsed CV does not exist",
        HttpStatusCode.NOT_FOUND_404
      )
    };

    const mergedData: DbCandidateParsedCvDto = { ...existingData, ...updateData };

    return candidateParsedCvDaoObj.updateCandidateParsedCvWithEmbedding(id, updateData, this.createSearchOptimizedCandidateParsedCvEmbeddingText(mergedData));
  }

  async updateCandidateParsedCvById(id: string, updateDto: Partial<DbCandidateParsedCvDto>): Promise<DbCandidateParsedCvDto | undefined> {
    return candidateParsedCvDaoObj.updateCandidateParsedCvById(id, updateDto);
  }

  async updateCandidateParsedCvByIds(ids: string[], updateDto: Partial<DbCandidateParsedCvDto>): Promise<boolean> {
    return candidateParsedCvDaoObj.updateCandidateParsedCvByIds(ids, updateDto);
  }

  async retrieveRegisteredUserDetailsForCandidateParsedCvSync(
    registeredCandidateEmail: string,
    latestCandidateParsedCv: DbCandidateParsedCvDto
  ): Promise<Partial<DbCandidateParsedCvDto>> {
    const existingUserDetails: DbUserDetailDto = await UserDetailService.getUserDetailsByEmail(
      registeredCandidateEmail
    );

    const {
      name,
      number,
      multipleCandidateExperience,
      location,
      CTC,
      ECTC,
      YOE,
      noticePeriod,
      isNoticePeriodNegotiable,
      CV,
    } = existingUserDetails;
    const {
      phoneCountryCode,
      phoneNumber
    } = getPhoneCountryCodeAndNumber(number);

    const existingCandSkillDetails: QueryResponse<DbUserSkillDto> = await UserSkillService.getUserSkillsByEmail(
      registeredCandidateEmail
    );

    const existingCandPreferences: QueryResponse<DbUserPreferenceDto> = await userPreferenceServiceObj.getUserPreferenceByEmail(
      registeredCandidateEmail
    );

    const syncData: Partial<DbCandidateParsedCvDto> = {
      name,
      phoneNumberDetails: {
        number: phoneNumber,
        countryCode: phoneCountryCode,
      },
      multipleCandidateExperience,
      location,
      currentCTC: CTC,
      expectedCTC: ECTC,
      totalYOE: YOE,
      noticePeriod,
      isNoticePeriodNegotiable,
      cvAwsS3FileName: CV,
      cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum.USER_RESUME,
      cvAwsS3BucketName: process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
      cvAwsS3FilePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
        "{userId}": existingUserDetails.id,
      }),
      cvAwsS3FileTracker: [
        ...(latestCandidateParsedCv.cvAwsS3FileTracker ?? []),
        {
          actionDate: dateHelperObj.getISODate(),
          resourceType: CandidateParsedCvAwsS3ResourceTypeEnum.USER_RESUME,
          bucketName: process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          filePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
            "{userId}": existingUserDetails.id,
          }),
          fileName: CV,
        },
      ],
      userDetailId: existingUserDetails.id,
    };

    if(existingCandSkillDetails.count) {
      syncData.coreSkills = existingCandSkillDetails[0].coreSkills;
      syncData.technicalSkills = existingCandSkillDetails[0].technicalSkills;
    }

    if(existingCandPreferences.count) {
      syncData.userPreferredDepartments = existingCandPreferences[0].userPreferredDepartments;
      syncData.userPreferredlocations = existingCandPreferences[0].userPreferredlocations;
      syncData.userPreferredIndustries = existingCandPreferences[0].userPreferredIndustries;
      syncData.userPreferredRoles = existingCandPreferences[0].userPreferredRoles;
    }

    return syncData;
  }
}

const candidateParsedCvServiceObj = new CandidateParsedCvService();
export { candidateParsedCvServiceObj, CandidateParsedCvService };
