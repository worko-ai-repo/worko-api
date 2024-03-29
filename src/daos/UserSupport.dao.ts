// Import the base dao
import BaseDao from "./Base.dao";

// Import the dtos
import { UserSupportCreateApiDto, UserSupportCreateDto, UserSupportFilterDto, UserSupportUpdateApiDto } from "../dtos/UserSupport.dto";

// Import the models
import { DbUserSupportDto, UserSupportModel } from "../db/models/UserSupport.model";

// Import the services
import UlidService from "../services/Ulid.service";

// Import necessary enums
import { UserSupportStatusEnum } from "../enums/User.enum";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { Query } from "dynamoose/dist/ItemRetriever";
import { AnyItem } from "dynamoose/dist/Item";
/**
 * UserSupportDao
 * 
 * Class responsible for managing user support related operations and communicating with DynamoDb
 */
class UserSupportDao implements BaseDao {
    modelName: string = "UserSupport";

    partitianKey: string = "USR#EML#{emailId}";
    sortKeys: { SK_INIT: string } = {
        SK_INIT: "SPRT#{id}"
    };

    GSI1PK: string = "SPRT#";
    GSI1SK = "ID#{id}";

    /**
     * createSupport
     *
     * Creates a new user support request.
     *
     * @param {string} emailId - Email of the user creating the support request
     * @param {UserSupportCreateApiDto} supportData - Data for the support request
     * @returns {Promise<DbUserSupportDto>} - Promise resolving to the created support object
     */
    async createSupport(emailAddress: string, userSupportCreateDto: UserSupportCreateDto): Promise<DbUserSupportDto> {
        // Unique id of the entry
        let id = UlidService.getUlidId();

        // Prepare the required details to create entry in the database
        const supportDbDetails = {
            PK: this.partitianKey.replace("{emailId}", emailAddress),
            SK: this.sortKeys.SK_INIT.replace("{id}", id),
            GSI1PK: this.GSI1PK,
            GSI1SK: this.GSI1SK.replace("{id}", id),
            id: id,
            ...userSupportCreateDto,
        };

        // Logger message
        global.logger.info("Creating support entry (request).", {
            filePath: __filename,
            methodName: this.createSupport.name,
            userEmail: emailAddress,
            userSupportCreateDto: userSupportCreateDto,
            supportDbDetails: supportDbDetails,
        });

        return UserSupportModel.create(supportDbDetails);
    }
    /**
     * updateSupportById
     *
     * Updates an existing user support request by its ID.
     *
     * @param {string} supportId - The ID of the support request to update.
     * @param {UserSupportUpdateApiDto} updateRequestBody - The updated data for the support request.
     * @returns {Promise<DbUserSupportDto>} - A Promise that resolves to the updated support object.
     */
    async updateSupportById(emailAddress: string, supportId: string, updateRequestBody: UserSupportUpdateApiDto): Promise<DbUserSupportDto> {

        // prepare PK and SK  by user's emailAddress and supportId
        let PK = this.partitianKey.replace("{emailId}", emailAddress);
        let SK = this.sortKeys.SK_INIT.replace("{id}", supportId);

        return UserSupportModel.update({ PK: PK, SK: SK }, updateRequestBody);
    }

    /**
     * getSupportList
     *
     * Retrieves a list of user support requests based on the provided filter options.
     *
     * @param {UserSupportFilterDto} filterOptions - The filter options to apply when retrieving the support list.
     * @returns {Promise<QueryResponse<DbUserSupportDto>>} - A Promise that resolves to a QueryResponse containing the list of support requests.
     */
    async getUserSupportList(filterOptions: UserSupportFilterDto): Promise<QueryResponse<DbUserSupportDto>> {
        // Prepare the query and define data type
        let query: Query<DbUserSupportDto>;

        // Check if userEmail is provided, then use the appropriate partition key
        if (filterOptions.userEmail) {
            const PK = this.partitianKey.replace("{emailId}", filterOptions.userEmail);
            const SK = this.sortKeys.SK_INIT.split("#")[0];
            console.log(SK);
            // Construct Query based on user email
            query = UserSupportModel.query("PK")
                .eq(PK)
                .where("SK")
                .beginsWith(SK);
        } else {
            query = UserSupportModel.query("GSI1PK").eq(this.GSI1PK);
        }

        // Add additional filters if provided
        if (filterOptions.status) {
            query = query.where("status").eq(filterOptions.status);
        }

        if (filterOptions.userSupportType) {
            // Filter by user support type (free text search)
            query = query.where("userSupportType").contains(filterOptions.userSupportType);
        }

        if (filterOptions.contextType) {
            // Filter by context type (free text search)
            query = query.where("contextType").eq(filterOptions.contextType);
        }

        if (filterOptions.contextId) {
            // Filter by context ID (free text search)
            query = query.where("contextId").eq(filterOptions.contextId);
        }

        if (filterOptions.assignedToUserId) {
            // Filter by assigned user ID (free text search)
            query = query.where("assignedToUserId").eq(filterOptions.assignedToUserId);
        }

        if (filterOptions.resolvedbyUserId) {
            // Filter by resolved by user ID (free text search)
            query = query.where("resolvedByUserId").eq(filterOptions.resolvedbyUserId);
        }

        // Execute the query and return the results
        // TODO: Add Paginations to support large result sets
        return query.exec();
    }

    async getSupportById(supportId: string): Promise<QueryResponse<DbUserSupportDto>> {
        // Prepare the sort key using the support ID
        let GSI1SK = this.GSI1SK.replace("{id}", supportId);

        // Execute the query and return the results
        return UserSupportModel.query("GSI1PK")
            .eq(this.GSI1PK)
            .where("GSI1SK")
            .eq(GSI1SK)
            .exec();
    }

}

const userSupportDao = new UserSupportDao();
export default userSupportDao;
