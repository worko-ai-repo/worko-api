import AWS, { DynamoDB } from "aws-sdk";

/**
 * AwsDynamoDBLibrary
 *
 * This library is a wrapper around the AWS DynamoDB service, providing methods to manage various operations.
 * It includes methods for CRUD operations, querying, scanning, batch operations, and table management.
 * Feel free to enhance this class as needed.
 */
class AwsDynamoDBLibrary {
    private dynamoDB: AWS.DynamoDB;
    private documentClient: AWS.DynamoDB.DocumentClient;

    /**
     * Constructor to initialize the DynamoDB client with the provided configuration.
     * @param config AWS DynamoDB ClientConfiguration object.
     */
    constructor(private config: AWS.DynamoDB.ClientConfiguration) {
        this.dynamoDB = new AWS.DynamoDB(this.config);
        this.documentClient = new AWS.DynamoDB.DocumentClient(this.config);

        console.log(`The '${AwsDynamoDBLibrary.name}' is initialized.`, {
            filePath: __filename,
        });
    }

    /**
     * Updates the configuration for the DynamoDB client.
     * @param config AWS DynamoDB ClientConfiguration object.
     */
    updateConfig(config: AWS.DynamoDB.ClientConfiguration): void {
        this.config = config;
        this.dynamoDB = new AWS.DynamoDB(config);
        this.documentClient = new AWS.DynamoDB.DocumentClient(config);
    }

    /**
     * Puts an item into a DynamoDB table.
     * @param params Parameters for the PutItem operation.
     * @returns Promise resolving to the result of the PutItem operation.
     */
    async putItem(params: AWS.DynamoDB.PutItemInput): Promise<AWS.DynamoDB.PutItemOutput> {
        global.logger.info("Putting item into table.", {
            filePath: __filename,
            methodName: this.putItem.name,
            params: params,
        });

        return this.dynamoDB.putItem(params).promise();
    }

    /**
     * Retrieves an item from a DynamoDB table.
     * @param params Parameters for the GetItem operation.
     * @returns Promise resolving to the result of the GetItem operation.
     */
    async getItem(params: AWS.DynamoDB.GetItemInput): Promise<AWS.DynamoDB.GetItemOutput> {
        global.logger.info("Getting item from table.", {
            filePath: __filename,
            methodName: this.getItem.name,
            params: params,
        });

        return this.dynamoDB.getItem(params).promise();
    }

    /**
     * Updates an existing item in a DynamoDB table.
     * @param params Parameters for the UpdateItem operation.
     * @returns Promise resolving to the result of the UpdateItem operation.
     */
    async updateItem(params: AWS.DynamoDB.UpdateItemInput): Promise<AWS.DynamoDB.UpdateItemOutput> {
        global.logger.info("Updating item in table.", {
            filePath: __filename,
            methodName: this.updateItem.name,
            params: params,
        });

        return this.dynamoDB.updateItem(params).promise();
    }

    /**
     * Deletes an item from a DynamoDB table.
     * @param params Parameters for the DeleteItem operation.
     * @returns Promise resolving to the result of the DeleteItem operation.
     */
    async deleteItem(params: AWS.DynamoDB.DeleteItemInput): Promise<AWS.DynamoDB.DeleteItemOutput> {
        global.logger.info("Deleting item from table.", {
            filePath: __filename,
            methodName: this.deleteItem.name,
            params: params,
        });

        return this.dynamoDB.deleteItem(params).promise();
    }

    /**
     * Queries items from a DynamoDB table.
     * @param params Parameters for the Query operation.
     * @returns Promise resolving to the result of the Query operation.
     */
    async query(params: AWS.DynamoDB.QueryInput): Promise<AWS.DynamoDB.QueryOutput> {
        global.logger.info("Querying items from table.", {
            filePath: __filename,
            methodName: this.query.name,
            params: params,
        });

        return this.dynamoDB.query(params).promise();
    }

    /**
     * Scans items from a DynamoDB table.
     * @param params Parameters for the Scan operation.
     * @returns Promise resolving to the result of the Scan operation.
     */
    async scan(params: AWS.DynamoDB.ScanInput): Promise<AWS.DynamoDB.ScanOutput> {
        global.logger.info("Scanning items from table.", {
            filePath: __filename,
            methodName: this.scan.name,
            params: params,
        });

        return this.dynamoDB.scan(params).promise();
    }

    /**
     * Retrieves multiple items from one or more DynamoDB tables.
     * @param params Parameters for the BatchGetItem operation.
     * @returns Promise resolving to the result of the BatchGetItem operation.
     */
    async batchGetItem(params: AWS.DynamoDB.BatchGetItemInput): Promise<AWS.DynamoDB.BatchGetItemOutput> {
        global.logger.info("Batch getting items from tables.", {
            filePath: __filename,
            methodName: this.batchGetItem.name,
            params: params,
        });

        return this.dynamoDB.batchGetItem(params).promise();
    }

    /**
     * Writes multiple items to one or more DynamoDB tables.
     * @param params Parameters for the BatchWriteItem operation.
     * @returns Promise resolving to the result of the BatchWriteItem operation.
     */
    async batchWriteItem(params: AWS.DynamoDB.BatchWriteItemInput): Promise<AWS.DynamoDB.BatchWriteItemOutput> {
        global.logger.info("Batch writing items to tables.", {
            filePath: __filename,
            methodName: this.batchWriteItem.name,
            params: params,
        });

        return this.dynamoDB.batchWriteItem(params).promise();
    }

    /**
     * Creates a new DynamoDB table.
     * @param params Parameters for the CreateTable operation.
     * @returns Promise resolving to the result of the CreateTable operation.
     */
    async createTable(params: AWS.DynamoDB.CreateTableInput): Promise<AWS.DynamoDB.CreateTableOutput> {
        global.logger.info("Creating new table.", {
            filePath: __filename,
            methodName: this.createTable.name,
            params: params,
        });

        return this.dynamoDB.createTable(params).promise();
    }

    /**
     * Deletes a DynamoDB table.
     * @param params Parameters for the DeleteTable operation.
     * @returns Promise resolving to the result of the DeleteTable operation.
     */
    async deleteTable(params: AWS.DynamoDB.DeleteTableInput): Promise<AWS.DynamoDB.DeleteTableOutput> {
        global.logger.info("Deleting table.", {
            filePath: __filename,
            methodName: this.deleteTable.name,
            params: params,
        });

        return this.dynamoDB.deleteTable(params).promise();
    }

    /**
     * Describes a DynamoDB table.
     * @param params Parameters for the DescribeTable operation.
     * @returns Promise resolving to the result of the DescribeTable operation.
     */
    async describeTable(params: AWS.DynamoDB.DescribeTableInput): Promise<AWS.DynamoDB.DescribeTableOutput> {
        global.logger.info("Describing table.", {
            filePath: __filename,
            methodName: this.describeTable.name,
            params: params,
        });

        return this.dynamoDB.describeTable(params).promise();
    }
}

export { AwsDynamoDBLibrary };
