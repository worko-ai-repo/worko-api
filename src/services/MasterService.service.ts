// Load the local daos
import masterServiceDao from "../daos/MasterService.dao";

// Load the local dtos
import { MasterServiceDTO } from "../dtos/MasterService.dto";

/**
 * MasterServiceService
 *
 *  Responsible for handling MasterService-related operations.
 */
class MasterServiceService {
  constructor() {}
  /**
   *
   * Creates a new master Service based on provided details.
   *
   * @param masterServiceDto - master Service details
   * @returns
   */
  async createNewMasterService(masterServiceDto: MasterServiceDTO) {
    console.log("Create new mater Service [service]");
    return masterServiceDao.addMasterService(masterServiceDto);
  }

  /**
   *
   * Get master Services
   *
   * @returns
   */
  async getMasterServicePlans() {
    console.log("Get all master Service [service]");
    return masterServiceDao.getAllMasterServices();
  }
}

// Export an instance of the MasterServiceService class
export default new MasterServiceService();
