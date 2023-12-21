//Load the base dao
import BaseDao from "./Base.dao";

//Load the local model
import { MasterServiceModel } from "../db/models/MasterService.model";

//Load the local dtos
import { MasterServiceDTO } from "../dtos/MasterService.dto";

//Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";

// Class definition for MasterServiceDao implementing BaseDao
class MasterServiceDao implements BaseDao {
  modelName = "MasterService";
  partitianKey = "SRVC#";
  sortKeys = { SK_SRVC: "ID#{ID}" };

  /**
   * Adds a Service using masterServiceDto
   *
   * @param masterServiceDto - Service data to be added
   */
  async addMasterService(masterServiceDto: MasterServiceDTO) {
    console.log("Create new mater Service [DAO]");
    const newMasterServiceDto = {
      PK: this.partitianKey,
      SK: this.sortKeys.SK_SRVC.strtr({
        "{ID}": UlidService.getUlidId(),
      }),

      ...masterServiceDto,
    };
    return MasterServiceModel.create(newMasterServiceDto);
  }

  /**
   *
   * Get all Service plans
   *
   */
  async getAllMasterServices() {
    console.log("get all master Service [DAO]");

    const PK = this.partitianKey;
    const SK = this.sortKeys.SK_SRVC.strtr({
      "{ID}": "",
    });
    return MasterServiceModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(SK)
      .exec();
  }
}

// Export an instance of MasterServiceDao
const masterServiceDao = new MasterServiceDao();

export default masterServiceDao;
