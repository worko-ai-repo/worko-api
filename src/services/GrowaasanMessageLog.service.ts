// import the daos
import { growaasanMessageLogDao } from "../daos/GrowaasanMessageLog.dao";

// import the DTOs
import { GrowaasanMessageLogCreateApiDto } from "../dtos/GrowaasanMessageLog.dto";

// import the models
import { DbGrowaasanMessageLogDto } from "../db/models/GrowaasanMessageLog.model";

/**
 * GrowaasanMessageLogService
 *
 * Service class for handling operations related to Growaasan message logs.
 * It manages the creation, retrieval, updating, and processing of logs
 * for Growaasan messages sent and received.
 */
class GrowaasanMessageLogService {
  /**
   * createGrowaasanMessageLog
   *
   * Creates a new Growaasan message log entry in the database.
   * It uses the GrowaasanMessageLogDao to create the log entry.
   *
   * @param {GrowaasanMessageLogCreateApiDto} growaasanMessagelogEntry - The object containing the data for the log entry to be created.
   * @returns {Promise<DbGrowaasanMessageLogDto>} - A Promise that resolves to the newly created Growaasan message log entry.
   */
  async createGrowaasanMessageLog(
    growaasanMessagelogEntry: GrowaasanMessageLogCreateApiDto
  ): Promise<DbGrowaasanMessageLogDto> {
    global.logger.info(
      "GrowaasanMessageLogService: createGrowaasanMessageLog: [service]",{
        filePath: __filename,
      }
    );

    // Using the REST syntax to retrieve user email and other data
    const { userEmail, ...remainingGrowaasanMessagelogEntry } = growaasanMessagelogEntry;

    // Create the log entry in the database
    return growaasanMessageLogDao.createGrowaasanMessageLog(
      userEmail,
      remainingGrowaasanMessagelogEntry
    );
  }
}

// Create an instance of the GrowaasanMessageLogService class
const growaasanMessageLogServiceObj = new GrowaasanMessageLogService();

// Export an instance of the GrowaasanMessageLogService class and the GrowaasanMessageLogService class
export { growaasanMessageLogServiceObj, GrowaasanMessageLogService };