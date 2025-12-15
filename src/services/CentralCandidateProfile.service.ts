// Import daos
import { centralCandidateProfileDaoObj } from "../daos/CentralCandidateProfile.dao";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import services
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";
import { dateHelperObj } from "../helpers/date.helper";

class CentralCandidateProfileService {
  async createCentralCandidateProfile(
    createData: DbCentralCandidateProfileDto
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    global.logger.info(`Create Central Candidate Profile [Service]`, {
      methodName: this.createCentralCandidateProfile.name,
    });

    return centralCandidateProfileDaoObj.createCentralCandidateProfile(
      createData
    );
  }

  async getCentralCandidateProfileById(
    id: string // candidate email
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    return centralCandidateProfileDaoObj.getCentralCandidateProfileById(id);
  }

  async updateCentralCandidateProfileById(
    id: string, // candidate email
    updateData: Partial<DbCentralCandidateProfileDto>
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    return centralCandidateProfileDaoObj.updateCentralCandidateProfileById(
      id,
      updateData
    );
  }

  async performCvCentralCandProfileUpdate(
    candidateEmail: string
  ): Promise<boolean> {
    const centralCandidateProfile: DbCentralCandidateProfileDto | undefined = await this.getCentralCandidateProfileById(
      candidateEmail
    );
    if (!centralCandidateProfile) {
      return false;
    }

    const {latestCandidateParsedCvId} = centralCandidateProfile;

    const latestCandidateParsedCv: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(latestCandidateParsedCvId);
    if (!latestCandidateParsedCv) {
      return false;
    }

    const updateData: Partial<DbCandidateParsedCvDto> = await candidateParsedCvServiceObj.retrieveRegisteredUserDetailsForCandidateParsedCvSync(
      candidateEmail,
      latestCandidateParsedCv
    );

    const updatedCandidateParsedCv: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.updateCandidateParsedCvWithEmbedding(latestCandidateParsedCvId, {
      ...updateData,
      updatedAt: dateHelperObj.getISODate(),
    });
    if (!updatedCandidateParsedCv) {
      return false;
    }

    return true;
  }
}

const centralCandidateProfileServiceObj = new CentralCandidateProfileService();
export { centralCandidateProfileServiceObj, CentralCandidateProfileService };
