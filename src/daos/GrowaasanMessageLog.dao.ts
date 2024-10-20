
// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { GrowaasanMessageLogCreateDto } from "../dtos/GrowaasanMessageLog.dto";

// Import models
import { DbGrowaasanMessageLogDto, GrowaasanMessageLogModel } from "../db/models/GrowaasanMessageLog.model";

// Import services
import UlidService from "../services/Ulid.service";

/**
 * GrowaasanMessageLogDao
 *
 * This data access object (DAO) handles interactions with the Growaasan message log database table.
 * It implements the BaseDao interface and provides methods to create and retrieve message log entries.
 */
class GrowaasanMessageLogDao implements BaseDao {
  modelName = "GrowaasanMessageLog";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = {
    SK_INIT: "GROWASN#LOG#ID#{id}", // `GROWASN` means `Growaasan` for Naming conventions we are using this shortcut
  };
  GSI1PK = "GROWASN#LOG#"; // `GROWASN` means `Growaasan` for Naming conventions we are using this shortcut
  GSI1SK = "ID#{id}";

  /**
   * createGrowaasanMessageLog
   *
   * Creates a new Growaasan message log entry in the database.
   * It uses the GrowaasanMessageLogDao to create the log entry.
   *
   * @param {string} userEmail - The user's email address to whom the message was sent.
   * @param {GrowaasanMessageLogCreateDto} remainingGrowaasanMessagelogEntry - The object containing the data for the log entry to be created.
   * @returns {Promise<DbGrowaasanMessageLogDto>} - A Promise that resolves to the newly created Growaasan message log entry.
   */
  async createGrowaasanMessageLog(
    userEmail: string,
    remainingGrowaasanMessagelogEntry: GrowaasanMessageLogCreateDto
  ): Promise<DbGrowaasanMessageLogDto> {
    // Generat`e a unique ID for the log entry
    let id: string = UlidService.getUlidId();

    // Construct the request payload for the database
    let growaasanMessageLogCreateRequest = {
      ...remainingGrowaasanMessagelogEntry,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": userEmail,
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{id}": id,
      }),
      id,
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": id,
      }),
    };

    // Save the log entry to the database
    return GrowaasanMessageLogModel.create(growaasanMessageLogCreateRequest);
  }
}

// create an instance of the GrowaasanMessageLogDao class
const growaasanMessageLogDao = new GrowaasanMessageLogDao();

// Export an instance of the GrowaasanMessageLogDao class and the GrowaasanMessageLogDao class
export {growaasanMessageLogDao, GrowaasanMessageLogDao};