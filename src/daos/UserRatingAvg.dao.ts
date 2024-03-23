// Import installed packages
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { UserRatingAvgCreateDTO } from "../dtos/UserRatingAvg.dto";

// Import models
import { DbUserRatingAvgDto, UserRatingAvgModel } from "../db/models/UserRatingAvg.model";

/**
 * UserRatingAvgDao
 * 
 * Class responsible for managing user rating average related operations.
 */
class UserRatingAvgDao implements BaseDao {
    modelName: string = "UserRatingAvg";
    partitianKey: string = "USR#EML#{emailId}";
    sortKeys: { SK_INIT: string } = {
        SK_INIT: "RATING#AVG",
    };

    /**
     * createRatingAverages
     * 
     * @param {string} emailId - for whom the review is being created
     * @param {UserRatingAvgCreateDTO} ratingAverages - rating details that needs to be created
     * @returns {Promise<DbUserRatingAvgDto>}
     */
    async createRatingAverages(emailId: string, ratingAverages: UserRatingAvgCreateDTO): Promise<DbUserRatingAvgDto> {
        const PK = this.partitianKey.replace("{emailId}", emailId);
        const SK = this.sortKeys.SK_INIT;
        return UserRatingAvgModel.create({ PK, SK, ...ratingAverages });
    }

    /**
     * getRatingAverages
     * 
     * @param {string} emailId - email for whom the ratings is to being fetched
     * @returns {Promise<QueryResponse<DbUserRatingAvgDto>>}
     */
    async getRatingAverages(emailId: string): Promise<QueryResponse<DbUserRatingAvgDto>> {
        // Prepare the details required to fetch the ratings
        const PK = this.partitianKey.replace("{emailId}", emailId);
        const SK = this.sortKeys.SK_INIT;

        // Fetch the ratings
        return UserRatingAvgModel
            .query("PK")
            .eq(PK)
            .where("SK")
            .eq(SK)
            .exec();
    }

    /**
     * updateRatingAverages
     * 
     * @param {string} emailId - for whom the review is being updated
     * @param {Partial<DbUserRatingAvgDto>} ratingAverages - rating details that needs to be updated
     * @returns {Promise<DbUserRatingAvgDto>}
     */
    async updateRatingAverages(emailId: string, ratingAverages: Partial<DbUserRatingAvgDto>): Promise<DbUserRatingAvgDto> {
        const PK = this.partitianKey.replace("{emailId}", emailId);
        const SK = this.sortKeys.SK_INIT;
        return UserRatingAvgModel.update({ PK: PK, SK: SK }, ratingAverages);
    }
}

const userRatingAvgDao = new UserRatingAvgDao();
export default userRatingAvgDao;
