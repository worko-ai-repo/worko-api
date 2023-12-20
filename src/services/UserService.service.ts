// Load the local daos
import userServiceDao from "../daos/UserService.dao";

// Load the local dtos
import {
  UserServiceInterviewGuidanceRequestDTO,
  UserServiceRequestDTO,
} from "../dtos/UserService.dto";

// @todo all methods from everything (Dao, Service, etc) should return the response,
// it will help the caller to know what happed with the action and what is the response.

/**
 *  UserServiceService class responsible for managing user-related operations.
 */
class UserServiceService {
  async createServiceRequest(
    email: string,
    userServiceRequestDTO:
      | UserServiceInterviewGuidanceRequestDTO
      | UserServiceRequestDTO
  ) {
    console.log("create service request for candidate[service]");
    return userServiceDao.createRequest(email, userServiceRequestDTO);
  }

  /**
   *
   *
   *
   * @param serviceId service request Id
   * @param email Email of the user
   * @returns Status,
   */
  async getStatus(serviceId: string, email: string) {
    console.log("Get candidate service status [service]");
    return userServiceDao.getStatus(email, serviceId);
  }
}

// Export an instance of the UserServiceService class
export default new UserServiceService();
