// import models
import { DbUserDetailDto } from "../db/models/UserDetail.model";
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";

// import services
import userDetailServiceObj from "../services/UserDetail.service";
import { corporateUserServiceObj } from "../services/CorporateUser.service";

/**
 * injectUserDetails
 *
 * Injects the user details into an array of entities given that the entities have either createdByUserId or createdByCorporateUserId.
 * 
 * NOTE: 
 *  1. This function only for `Attach user details by user id(corporate user id or worko admin user id) with entity`
 *  2. This function doesn't work for `Attach user details by user email(corporate user email or worko admin user email) with entity`
 *
 * @param {EntityDto[]} entityDto - The array of entities to be injected with user details.
 * @returns {Promise<(EntityDto & { corporateUserDetails: DbCorporateUserDto | undefined; userDetails: DbUserDetailDto | undefined; })[]>} - The array of entities with user details injected.
 */
export async function injectUserDetails<
  EntityDto extends {
    createdByUserId?: string;
    createdByCorporateUserId?: string;
  }
>(
  entityDto: EntityDto[]
): Promise<
  (EntityDto & {
    corporateUserDetails: DbCorporateUserDto | undefined;
    userDetails: DbUserDetailDto | undefined;
  })[]
> {
  // logger
  global.logger.info(`Inject user details with the given entity`, {
    filePath: __filename,
    methodName: "injectUserDetails",
  });

  // Get unique user IDs 
  let uniqueCreatedByUserIds: string[] = Array.from(
    new Set(entityDto.map((item) => item.createdByUserId))
  ).filter((id) => id !== undefined);

  // Get user details for each unique user ID
  const userDetails: DbUserDetailDto[] = await userDetailServiceObj.getUserByIds(
    uniqueCreatedByUserIds
  )

  // Create a map of user IDs to user details
  const userDetailsMap: Map<string, DbUserDetailDto> = new Map(
    userDetails.filter(detail => detail?.id).map((eachUserDetail: DbUserDetailDto) => [
      eachUserDetail.id,
      eachUserDetail,
    ])
  );

  // Get unique corporate user IDs
  let uniqueCreatedByCorporateUserIds: string[] = Array.from(
    new Set(entityDto.map((item) => item.createdByCorporateUserId))
  ).filter((id) => id !== undefined);

  // Get corporate user details for each unique corporate user ID
  const corporateUserDetails: DbCorporateUserDto[] = await corporateUserServiceObj.getCorpUserByIds(
    uniqueCreatedByCorporateUserIds
  )

  // Create a map of corporate user IDs to corporate user details
  const corporateUserDetailsMap: Map<string, DbCorporateUserDto> = new Map(
    corporateUserDetails.filter(detail => detail?.id).map((eachCorporateUserDetail: DbCorporateUserDto) => [
      eachCorporateUserDetail.id,
      eachCorporateUserDetail,
    ])
  );

  // Add user details to each entity
  const entityWithUserDetailsResponse = await Promise.all(
    entityDto.map((eachEntityDto: EntityDto) => {
      // Add user details to each entity
      const entityWithUserDetails: EntityDto & {
        corporateUserDetails: DbCorporateUserDto | undefined;
        userDetails: DbUserDetailDto | undefined;
      } = {
        ...eachEntityDto,
        corporateUserDetails: eachEntityDto.createdByCorporateUserId
          ? corporateUserDetailsMap.get(eachEntityDto.createdByCorporateUserId)
          : undefined,
        userDetails: eachEntityDto.createdByUserId
          ? userDetailsMap.get(eachEntityDto.createdByUserId)
          : undefined,
      };

      // Return the entity with user details
      return entityWithUserDetails;
    })
  );

  // return the entity with user details
  return entityWithUserDetailsResponse;
}
