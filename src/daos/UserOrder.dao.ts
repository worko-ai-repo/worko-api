// Import Dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load the base DAO
import BaseDao from "./Base.dao";

// Load DTOs and other packages
import { UserOrderCreateDTO, UserOrderUpdateDTO } from "../dtos/UserOrder.dto";

// Load the local model
import { DbUserOrderDto, UserOrderModel } from "../db/models/UserOrder.model";

// Load UlidService for generating ULID IDs
import UlidService from "../services/Ulid.service";
import { UserOrderTypeEnum } from "../enums/UserOrder.enum";

// UserOrderDao class implementing the BaseDao interface
class UserOrderDao implements BaseDao {
    // Define the model name
    modelName = "UserOrder";

    // Define the partition key pattern
    partitianKey = "USR#EML#{primaryEmail}";

    // Define the sort key patterns
    sortKeys = {
        SK_ID: "ORDER#TYPE#{orderType}#ID#{id}",
    };
    GSI1PK: string = "ORDER#";
    GSI1SK = "TYPE#{orderType}#ID#{id}";

    /**
     * create
     *
     * Creates a new user order in the DynamoDB table.
     *
     * @param {string} userEmail - The email address of the user
     * @param {UserOrderCreateDTO} createOrder - The details of the user order to be created
     * @returns {Promise<DbUserOrderDto>} - A promise that resolves to the created user order
     */
    async create(
        userEmail: string,
        createOrder: UserOrderCreateDTO
    ): Promise<DbUserOrderDto> {
        // Log the start of the create user order operation
        global.logger.info("Create user order [DAO]");

        // Generate a new ULID ID
        const id = UlidService.getUlidId();

        // Prepare the details for creating the user order
        const createOrderDetails = {
            ...createOrder,
            id: id,
            PK: this.partitianKey.strtr({
                "{primaryEmail}": userEmail
            }),
            SK: this.sortKeys.SK_ID.strtr({
                "{orderType}": createOrder.orderType,
                "{id}": id,
            }),
            GSI1PK: this.GSI1PK,
            GSI1SK: this.GSI1SK.strtr({
                "{orderType}": createOrder.orderType,
                "{id}": id,
            })
        };

        // Create the user order 
        return UserOrderModel.create(createOrderDetails);
    }

    /**
     * getOrderByOrderId
     * 
     * @todo rename this to "getUserOrderByOrderId"
     *
     * Retrieves a user order by its order ID from the DynamoDB table.
     *
     * @param {string} userEmail - The email address of the user
     * @param {string} orderType - The type of the order
     * @param {string} orderId - The ID of the user order to retrieve
     * @returns {Promise<DbUserOrderDto>} - A promise that resolves to the retrieved user order
     */
    async getOrderByOrderId(userEmail: string, orderType: string, orderId: string): Promise<DbUserOrderDto> {
        // Log the start of the get user order by order ID operation
        global.logger.info("Get user order by order ID [DAO]");

        // Prepare the keys for the query
        const keys = {
            PK: this.partitianKey.strtr({
                "{primaryEmail}": userEmail,
            }),
            SK: this.sortKeys.SK_ID.strtr({
                "{orderType}": orderType,
                "{id}": orderId,
            }),
        };

        // Retrieve the user order
        return UserOrderModel.get(keys);
    }

    /**
     * update
     *
     * Updates a user order in the DynamoDB table.
     *
     * @param {string} UserEmail - The email address of the user
     * @param {string} id - The ID of the user order to update
     * @param {UserOrderTypeEnum} orderType - The type of the order
     * @param {UserOrderUpdateDTO} userOrder - The updated user order details
     * @returns {Promise<DbUserOrderDto>} - A promise that resolves to the updated user order
     */
    async update(UserEmail: string, id: string, orderType: UserOrderTypeEnum, userOrder: UserOrderUpdateDTO): Promise<DbUserOrderDto> {
        // Prepare the partition key and sort key
        let PK = this.partitianKey.strtr({
            "{primaryEmail}": UserEmail
        });

        let SK = this.sortKeys.SK_ID.strtr({
            "{orderType}": orderType,
            "{id}": id,
        });

        // Update the user order 
        return UserOrderModel.update({ PK, SK }, userOrder);
    }

    /**
     * Retrieves user orders based on the provided user email.
     * 
     * @todo rename this to "getUserOrders"
     *
     * @param {string} userEmail - The email address of the user.
     * @return {Promise<QueryResponse<DbUserOrderDto>>} A promise that resolves to an array of user orders.
     */
    async get(userEmail:string):Promise<QueryResponse<DbUserOrderDto>>{
        global.logger.info("Get user orders [DAO]");
        const PK = this.partitianKey.strtr({
            "{primaryEmail}": userEmail
        }); 
        return UserOrderModel.query("PK")
        .eq(PK)
        .where("SK")
        .beginsWith("ORDER#TYPE#")
        .exec()
    }
}

// Instantiate the UserOrderDao class
const userOrderDao = new UserOrderDao();

// Export the default instance of the UserOrderDao
export default userOrderDao;
