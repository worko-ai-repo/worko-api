// Import the npm packages
import { ObjectType } from "dynamoose/dist/General";

import { SortOrderTypeEnum } from "../enums/Common.enum";

/**
 * RecordListingFilterOptions
 * 
 * It is similar to "RecordListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface RecordListingFilterOptions {
  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey (offset)
   *
   * The "lastKey" property value returned by the "Dynamoose" in the previous "query" response.
   *
   * This will become the parameter for the "startAt" method of Dynamoose in the next query.
   *
   * Sample Value: { SK: 'ID#01HHM4Q0DDH1A5S56HJQ71P82V', PK: 'COMP#' }
   */
  lastKey?: ObjectType;

  // sortOrder means the order in which the records should be sorted. posible values: "ascending" or "descending"
  sortOrder?: SortOrderTypeEnum | undefined;

  // search text
  searchText?: string | undefined;

  /**
   * fromDate
   *
   * The "fromDate" value was returned by backend code internally,
   * after converting it from "string" to "timestamp" format.(check in "request.helper.ts")
   * And type of the "timestamp" is number or undefined.
   *
   * To know more about conversion of "fromDate" from "string" to "timestamp" you can Go to "request.helper.ts" file,
   * and check The "parseFilterOptions" function present in "RequestHelper" class.
   *
   * Sample Value of "fromDate" after converting from "string" to "timestamp": 1661115600000
   */
  fromDate?: number | undefined;

  /**
   * toDate
   *
   * The "toDate" value was returned by backend code internally,
   * after converting it from "string" to "timestamp" format.(check in "request.helper.ts")
   * And type of the "timestamp" is number or undefined.
   *
   * To know more about conversion of "toDate" from "string" to "timestamp" you can Go to "request.helper.ts" file,
   * and check The "parseFilterOptions" function present in "RequestHelper" class.
   *
   * Sample Value of "toDate" after converting from "string" to "timestamp": 1661115600000
   */
  toDate?: number | undefined;
}

/**
 * RecordListingFilterRequestDTO
 * 
 * The possible data expected in the request payload if API wants to filter the data.
 */
export interface RecordListingFilterRequestDTO {
  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey (offset)
   *
   * The "lastKey" property value returned by the "Dynamoose" in the previous "query" response.
   *
   * This will become the parameter for the "startAt" method of Dynamoose in the next query.
   *
   * The "lastKey" property from Dynamoose: { SK: 'ID#01HHM4Q0DDH1A5S56HJQ71P82V', PK: 'COMP#' }
   * Sample Value: eyBTSzogJ0lEIzAxSEhNNFEwRERIMUE1UzU2SEpRNzFQODJWJywgUEs6ICdDT01QIycgfQ==
   */
  lastKey?: string | undefined;

  // sortOrder means the order in which the records should be sorted. posible values: "ascending" or "descending"
  sortOrder?: SortOrderTypeEnum | undefined;

  // search text
  searchText?: string | undefined;

  /**
   * fromDate
   *
   * The "fromDate" value will be come from frontend request payload.
   *
   * Sample Value of "fromDate": "2024-07-01T11:07:42.506Z"
   */
  fromDate?: string | undefined;

  /**
   * toDate
   *
   * The "toDate" value will be come from frontend request payload.
   *
   * Sample Value of "toDate": "2024-07-01T12:07:42.506Z"
   */
  toDate?: string | undefined;
}

/**
 * RecordListingPaginationResponseDTO
 * 
 * The representation of the pagination details that would be passed to the API consumer.
 */
export interface RecordListingPaginationResponseDTO {
  // The number of records returned back in the API response.
  count: number;

  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey (offset)
   *
   * The "lastKey" property value returned by the "Dynamoose" in the "query" response.
   *
   * This will become the parameter for the "startAt" method of Dynamoose in the next query.
   *
   * "lastKey" from Dynamoose: { SK: 'ID#01HHM4Q0DDH1A5S56HJQ71P82V', PK: 'COMP#' }
   * Sample Value: eyBTSzogJ0lEIzAxSEhNNFEwRERIMUE1UzU2SEpRNzFQODJWJywgUEs6ICdDT01QIycgfQ==
   */
  lastKey?: string | undefined;

  // sortOrder means the order in which the records should be sorted. posible values: "ascending" or "descending"
  sortOrder?: SortOrderTypeEnum | undefined;

  // The `timesQueried` is the number of requests made to AWS DynamoDB to fulfill the query response.
  timesQueried?: number | undefined;

  // If filter is applied then the filtered record count from the all records. Otherwise it would be undefined.
  queriedCount?: number | undefined;
}

/**
 * RecordListingResponseDTO
 * 
 * The main response would be retruend back in the API response. It would include the pagination details and records.
 */
export interface RecordListingResponseDTO<EntityDetails> {
  data: EntityDetails;
  pagination: RecordListingPaginationResponseDTO;
}

/**
 * These are used in the "paginationRecordListingResponse" function present in "pagination-response.helper.ts"
 * which generates the response structure for the entity listing end points.
 * 
 * Interface representing pagination-related data for entity listings.
 */
export interface EntityDetailsPaginationData {
  count: number;
  lastKey?: ObjectType | undefined;
  timesQueried?: number | undefined;
  queriedCount?: number | undefined;
}
