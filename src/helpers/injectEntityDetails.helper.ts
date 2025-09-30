
// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import models
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbUserDetailDto } from "../db/models/UserDetail.model";

// import services
import userDetailServiceObj from "../services/UserDetail.service";
import { corporateUserServiceObj } from "../services/CorporateUser.service";
import { getEmailFromPK } from "./user.helper";

class InjectEntityDetailsHelper {
  async injectCorporateUserDetailsByCompanyIdAndEmail<
    EntityDto extends { email: string; companyId: string }
  >(
    entityDto: EntityDto[]
  ): Promise<(EntityDto & { corporateUserDetails?: DbCorporateUserDto })[]> {
    // Logger
    global.logger.info(
      "Processing request to inject Corporate User details by company ID and email. [SERVICE]",
      {
        methodName: this.injectCorporateUserDetailsByCompanyIdAndEmail.name,
        entityDtoCount: entityDto.length,
      }
    );

    // Return early if no entities provided
    if (!entityDto.length) {
      return entityDto;
    }

    // Process each entity and attach corporate user details if found
    const enrichedEntities = await Promise.all(
      entityDto.map(async (entity: EntityDto) => {
        try {
          const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
            await corporateUserServiceObj.getUserByCompanyIdAndUserEmail(
              entity.email,
              entity.companyId
            );

          // Attach corporateUserDetails if found
          if (corporateUserDetails.count) {
            return {
              ...entity,
              corporateUserDetails: corporateUserDetails[0],
            };
          }

          // Return entity without corporateUserDetails if not found
          return entity;
        } catch (error) {
          // Log error but don't fail the entire operation
          global.logger.error(
            "Error fetching corporate user details for entity",
            {
              filePath: __filename,
              methodName:
                this.injectCorporateUserDetailsByCompanyIdAndEmail.name,
              email: entity.email,
              companyId: entity.companyId,
              error: error,
            }
          );

          // Return entity without corporateUserDetails on error
          return entity;
        }
      })
    );

    return enrichedEntities;
  }

  async injectEntityWithUserDetails<EntityDto extends { PK: string, acceptedByUserId?: string, doneByUserId?: string}>(
    entityDto: EntityDto[],
    isCandidateDetailsRequired: boolean = false,
    isEmployeeDetailsRequired: boolean = false,
  ): Promise<
    (EntityDto & {
      userDetails?: DbUserDetailDto,
      employeeDetails?: DbUserDetailDto,
    })[]
  > {
    global.logger.info("Inject user details with the given entity [Service]", {
      methodName: this.injectEntityWithUserDetails.name,
    });

    if(!entityDto.length) {
      return entityDto;
    }

    // If user details are not required, return early
    if(!isCandidateDetailsRequired && !isEmployeeDetailsRequired) {
      return entityDto;
    }
    
    let userDetailsMap: Map<string, DbUserDetailDto> = new Map();
    if(isCandidateDetailsRequired) {
      // get unique user email ids
      const uniqueUserEmailIds: string[] = Array.from(
        new Set(entityDto.map((item: EntityDto) => item.PK.split("#")[2]))
      );

      // get user details by unique user email ids
      const userDetailsArray: DbUserDetailDto[] =
        await userDetailServiceObj.getUserDetailsByPkEmailIds(
          uniqueUserEmailIds
        );

      // Covert user details to map for easy access
      userDetailsMap = new Map(
        userDetailsArray.map((userDetail: DbUserDetailDto) => [
          userDetail.PK.split("#")[2],
          userDetail,
        ])
      );
    }

    let employeeDetailsMap: Map<string, DbUserDetailDto> = new Map();
    if(isEmployeeDetailsRequired) {
      // get unique employee user ids for employeeDetails
      const uniqueEmployeeUserIds: string[] = Array.from(
        new Set(
          entityDto
            .map((item: EntityDto) => {
              if (item.doneByUserId) return item.doneByUserId;
              if (item.acceptedByUserId) return item.acceptedByUserId;
              return null;
            })
            .filter((id: string | null): id is string => id !== null)
        )
      );

      // get employee details by user ids
      const employeeDetailsArray: DbUserDetailDto[] =
        uniqueEmployeeUserIds.length
          ? await userDetailServiceObj.getUserByIds(uniqueEmployeeUserIds)
          : [];

      // convert employee details to map for easy access
      employeeDetailsMap = new Map(
        employeeDetailsArray.map((employeeDetail: DbUserDetailDto) => [
          employeeDetail.id,
          employeeDetail,
        ])
      );
    }

    // attach user details to given entity
    const entityWithUserDetails = await Promise.all(
      entityDto.map(async (eachEntityDto: EntityDto) => {
        // get user details for each entity
        const userDetails = isCandidateDetailsRequired && eachEntityDto.PK ? userDetailsMap.get(getEmailFromPK(eachEntityDto.PK)) : undefined;

        // get employee details based on priority: doneByUserId > acceptedByUserId
        const employeeUserId: string | undefined = eachEntityDto.doneByUserId || eachEntityDto.acceptedByUserId;
        const employeeDetails = isEmployeeDetailsRequired && employeeUserId ? employeeDetailsMap.get(employeeUserId) : undefined;

        let entityDetailWithUserDetail: EntityDto & {
          userDetails?: DbUserDetailDto;
          employeeDetails?: DbUserDetailDto;
        } = {
          ...eachEntityDto,
        };

        // if user details not found, return entity without User details
        if (userDetails) {
          entityDetailWithUserDetail.userDetails = userDetails;
        }

        // if employee details not found, return entity without employee details
        if (employeeDetails) {
          entityDetailWithUserDetail.employeeDetails = employeeDetails;
        }

        return entityDetailWithUserDetail;
      })
    );

    return entityWithUserDetails;
  }
}

const injectEntityDetailsHelperObj: InjectEntityDetailsHelper =
  new InjectEntityDetailsHelper();
export { injectEntityDetailsHelperObj, InjectEntityDetailsHelper };
