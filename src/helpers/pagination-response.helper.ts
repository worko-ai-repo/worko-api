// import dtos
import { RecordListingResponseDTO } from "../dtos/Common.dto";
import {
  EntityDetailsPaginationData,
  EntityListingPaginationFilterOptions,
} from "../dtos/Common.dto";

// import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// import helpers
import { lastKeyToBase64EncodeStr } from "./dynamoose.helper";

/**
 * paginationRecordListingResponse
 *
 * It generates the response structure for the entity listing end points.
 * Entity examples: Company, Subscription, User, Referral, SupportRequest etc.
 * 
 * REFERENCE TUTORIAL[Typescript Generics]: https://youtu.be/EcCTIExsqmI?si=3g9M7sVRUeoL3dj7
 *
 * @param {EntityDetails} data - The data which contains the records, count, queriedCount, lastKey.
 * @param {EntityListingFilterOptions} filterRequest - The filter options which contains the pageSize and sortOrder.
 * @return {RecordListingResponseDTO<EntityDetails>} The response structure which contains the data and pagination details.
 */
export function paginationRecordListingResponse<
  EntityDetails extends EntityDetailsPaginationData,
  EntityListingFilterOptions extends EntityListingPaginationFilterOptions
>(
  data: EntityDetails,
  filterRequest: EntityListingFilterOptions
): RecordListingResponseDTO<EntityDetails> {
  return {
    data,
    pagination: {
      count: data.count,
      queriedCount: data.queriedCount,
      pageSize: filterRequest.pageSize,
      lastKey: lastKeyToBase64EncodeStr(data.lastKey),
      sortOrder: filterRequest.sortOrder ?? SortOrderTypeEnum.DESCENDING,
    },
  };
}