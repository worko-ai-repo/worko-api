import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  type DynamoDBClientConfig,
  type PutItemCommandInput,
  type PutItemCommandOutput,
  type GetItemCommandInput,
  type GetItemCommandOutput,
  type UpdateItemCommandInput,
  type UpdateItemCommandOutput,
  type DeleteItemCommandInput,
  type DeleteItemCommandOutput,
  type QueryCommandInput,
  type QueryCommandOutput,
  type ScanCommandInput,
  type ScanCommandOutput,
  type BatchGetItemCommandInput,
  type BatchGetItemCommandOutput,
  type BatchWriteItemCommandInput,
  type BatchWriteItemCommandOutput,
  type CreateTableCommandInput,
  type CreateTableCommandOutput,
  type DeleteTableCommandInput,
  type DeleteTableCommandOutput,
  type DescribeTableCommandInput,
  type DescribeTableCommandOutput,
} from "@aws-sdk/client-dynamodb";

/**
 * AwsDynamoDBLibrary
 *
 * This library is a wrapper around the AWS DynamoDB service, providing methods to manage various operations.
 * It includes methods for CRUD operations, querying, scanning, batch operations, and table management.
 * Feel free to enhance this class as needed.
 */
class AwsDynamoDBLibrary {
    private dynamoDB: DynamoDBClient;

    /**
     * Constructor to initialize the DynamoDB client with the provided configuration.
     * @param config AWS DynamoDB ClientConfiguration object.
     */
    constructor(private config: DynamoDBClientConfig) {
        this.dynamoDB = new DynamoDBClient(this.config);

        console.log(`The '${AwsDynamoDBLibrary.name}' is initialized.`, {
            filePath: __filename,
        });
    }

    /**
     * Updates the configuration for the DynamoDB client.
     * @param config AWS DynamoDB ClientConfiguration object.
     */
    updateConfig(config: DynamoDBClientConfig): void {
        this.config = config;
        this.dynamoDB = new DynamoDBClient(config);
    }

    /**
     * Puts an item into a DynamoDB table.
     * @param params Parameters for the PutItem operation.
     * @returns Promise resolving to the result of the PutItem operation.
     */
    async putItem(params: PutItemCommandInput): Promise<PutItemCommandOutput> {
        global.logger.info("Putting item into table.", {
            filePath: __filename,
            methodName: this.putItem.name,
            params: params,
        });

        return this.dynamoDB.send(new PutItemCommand(params));
    }

    /**
     * Retrieves an item from a DynamoDB table.
     * @param params Parameters for the GetItem operation.
     * @returns Promise resolving to the result of the GetItem operation.
     */
    async getItem(params: GetItemCommandInput): Promise<GetItemCommandOutput> {
        global.logger.info("Getting item from table.", {
            filePath: __filename,
            methodName: this.getItem.name,
            params: params,
        });

        return this.dynamoDB.send(new GetItemCommand(params));
    }

    /**
     * Updates an existing item in a DynamoDB table.
     * @param params Parameters for the UpdateItem operation.
     * @returns Promise resolving to the result of the UpdateItem operation.
     */
    async updateItem(params: UpdateItemCommandInput): Promise<UpdateItemCommandOutput> {
        global.logger.info("Updating item in table.", {
            filePath: __filename,
            methodName: this.updateItem.name,
            params: params,
        });

        return this.dynamoDB.send(new UpdateItemCommand(params));
    }

    /**
     * Deletes an item from a DynamoDB table.
     * @param params Parameters for the DeleteItem operation.
     * @returns Promise resolving to the result of the DeleteItem operation.
     */
    async deleteItem(params: DeleteItemCommandInput): Promise<DeleteItemCommandOutput> {
        global.logger.info("Deleting item from table.", {
            filePath: __filename,
            methodName: this.deleteItem.name,
            params: params,
        });

        return this.dynamoDB.send(new DeleteItemCommand(params));
    }

    /**
     * Queries items from a DynamoDB table.
     * @param params Parameters for the Query operation.
     * @returns Promise resolving to the result of the Query operation.
     */
    async query(params: QueryCommandInput): Promise<QueryCommandOutput> {
        global.logger.info("Querying items from table.", {
            filePath: __filename,
            methodName: this.query.name,
            params: params,
        });

        return this.dynamoDB.send(new QueryCommand(params));
    }

    /**
     * Scans items from a DynamoDB table.
     * @param params Parameters for the Scan operation.
     * @returns Promise resolving to the result of the Scan operation.
     */
    async scan(params: ScanCommandInput): Promise<ScanCommandOutput> {
        global.logger.info("Scanning items from table.", {
            filePath: __filename,
            methodName: this.scan.name,
            params: params,
        });

        return this.dynamoDB.send(new ScanCommand(params));
    }

    /**
     * Retrieves multiple items from one or more DynamoDB tables.
     * @param params Parameters for the BatchGetItem operation.
     * @returns Promise resolving to the result of the BatchGetItem operation.
     */
    async batchGetItem(params: BatchGetItemCommandInput): Promise<BatchGetItemCommandOutput> {
        global.logger.info("Batch getting items from tables.", {
            filePath: __filename,
            methodName: this.batchGetItem.name,
            params: params,
        });

        return this.dynamoDB.send(new BatchGetItemCommand(params));
    }

    /**
     * Writes multiple items to one or more DynamoDB tables.
     * @param params Parameters for the BatchWriteItem operation.
     * @returns Promise resolving to the result of the BatchWriteItem operation.
     */
    async batchWriteItem(params: BatchWriteItemCommandInput): Promise<BatchWriteItemCommandOutput> {
        global.logger.info("Batch writing items to tables.", {
            filePath: __filename,
            methodName: this.batchWriteItem.name,
            params: params,
        });

        return this.dynamoDB.send(new BatchWriteItemCommand(params));
    }

    /**
     * Creates a new DynamoDB table.
     * @param params Parameters for the CreateTable operation.
     * @returns Promise resolving to the result of the CreateTable operation.
     */
    async createTable(params: CreateTableCommandInput): Promise<CreateTableCommandOutput> {
        global.logger.info("Creating new table.", {
            filePath: __filename,
            methodName: this.createTable.name,
            params: params,
        });

        return this.dynamoDB.send(new CreateTableCommand(params));
    }

    /**
     * Deletes a DynamoDB table.
     * @param params Parameters for the DeleteTable operation.
     * @returns Promise resolving to the result of the DeleteTable operation.
     */
    async deleteTable(params: DeleteTableCommandInput): Promise<DeleteTableCommandOutput> {
        global.logger.info("Deleting table.", {
            filePath: __filename,
            methodName: this.deleteTable.name,
            params: params,
        });

        return this.dynamoDB.send(new DeleteTableCommand(params));
    }

    /**
     * Describes a DynamoDB table.
     * @param params Parameters for the DescribeTable operation.
     * @returns Promise resolving to the result of the DescribeTable operation.
     */
    async describeTable(params: DescribeTableCommandInput): Promise<DescribeTableCommandOutput> {
        global.logger.info("Describing table.", {
            filePath: __filename,
            methodName: this.describeTable.name,
            params: params,
        });

        return this.dynamoDB.send(new DescribeTableCommand(params));
    }
}

export { AwsDynamoDBLibrary };
