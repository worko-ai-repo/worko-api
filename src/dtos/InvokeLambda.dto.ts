
// import enums
import { MatchingScoreEntityEnum } from "../enums/Common.enum";

/**
 * InvokeLambdMatchingScoreCalcualtionDto
 */
export interface InvokeLambdMatchingScoreCalcualtionDto {
  USER_PK: string;
  USER_DETAIL_SK: string;
  MATCHING_ENTITY: MatchingScoreEntityEnum;
  ENTITY_SK: string;
}