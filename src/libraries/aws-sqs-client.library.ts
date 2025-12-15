// NPM packages
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  PurgeQueueCommand,
  GetQueueUrlCommand,
  CreateQueueCommand,
  type SQSClientConfig,
  type SendMessageCommandInput,
  type SendMessageCommandOutput,
  type ReceiveMessageCommandInput,
  type ReceiveMessageCommandOutput,
  type DeleteMessageCommandInput,
  type DeleteMessageCommandOutput,
  type PurgeQueueCommandInput,
  type PurgeQueueCommandOutput,
  type GetQueueUrlCommandInput,
  type CreateQueueCommandInput,
  type CreateQueueCommandOutput,
} from "@aws-sdk/client-sqs";

/**
 * AwsSqsClientLibrary
 *
 * This library is a wrapper library for AWS SQS service that has regularly used methods.
 * Feel free to enhance this as needed.
 */
class AwsSqsClientLibrary {
  /**
   * sqs
   *
   * AWS SQS object to perform SQS related operations.
   */
  private sqs: SQSClient;

  /**
   * constructor
   *
   * @param {SQSClientConfig} config
   */
  constructor(private config: SQSClientConfig) {
    this.sqs = new SQSClient(this.config);

    // Log message
    console.log(`The '${AwsSqsClientLibrary.name}' is initialised."`, {
      filePath: __filename,
    });
  }

  /**
   * updateConfig
   *
   * Update the AWS SQS configuration
   *
   * @param {AWS.SQS.ClientConfiguration} config
   * @returns {void}
   */
  updateConfig(config: SQSClientConfig): void {
    this.config = config;
    this.sqs = new SQSClient(config);
  }

  /**
   * ********************************************************************************************************************************************
   * Manage Sending Messages
   * ********************************************************************************************************************************************
   */

  /**
   * sendMessage
   * 
   * Send a message to an SQS queue
   * 
   * @param {string} queueUrl 
   * @param {string} messageBody 
   * @param {number} [delaySeconds] 
   * @returns {Promise<AWS.SQS.SendMessageResult>}
   */
  async sendMessage(queueUrl: string, messageBody: string, delaySeconds?: number): Promise<SendMessageCommandOutput> {
    const params: SendMessageCommandInput = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      ...(delaySeconds && { DelaySeconds: delaySeconds }),
    };

    // Logger message
    global.logger.info("Sending message to SQS queue (data).", {
      filePath: __filename,
      methodName: this.sendMessage.name,
      queueUrl: queueUrl,
      messageBody: messageBody,
      delaySeconds: delaySeconds,
    });

    return this.sqs.send(new SendMessageCommand(params));
  }

  /**
   * ********************************************************************************************************************************************
   * Manage Receiving Messages
   * ********************************************************************************************************************************************
   */

  /**
   * receiveMessages
   * 
   * Receive messages from an SQS queue
   * 
   * @param {string} queueUrl 
   * @param {number} [maxNumberOfMessages=1] 
   * @param {number} [waitTimeSeconds=0] 
   * @returns {Promise<AWS.SQS.ReceiveMessageResult>}
   */
  async receiveMessages(queueUrl: string, maxNumberOfMessages: number = 1, waitTimeSeconds: number = 0): Promise<ReceiveMessageCommandOutput> {
    const params: ReceiveMessageCommandInput = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds,
    };

    // Logger message
    global.logger.info("Receiving messages from SQS queue (data).", {
      filePath: __filename,
      methodName: this.receiveMessages.name,
      queueUrl: queueUrl,
      maxNumberOfMessages: maxNumberOfMessages,
      waitTimeSeconds: waitTimeSeconds,
    });

    return this.sqs.send(new ReceiveMessageCommand(params));
  }

  /**
   * ********************************************************************************************************************************************
   * Manage Deleting Messages
   * ********************************************************************************************************************************************
   */

  /**
   * deleteMessage
   * 
   * Delete a message from an SQS queue
   * 
   * @param {string} queueUrl 
   * @param {string} receiptHandle 
   * @returns {Promise<{}>}
   */
  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<DeleteMessageCommandOutput> {
    const params: DeleteMessageCommandInput = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    // Logger message
    global.logger.info("Deleting message from SQS queue (data).", {
      filePath: __filename,
      methodName: this.deleteMessage.name,
      queueUrl: queueUrl,
      receiptHandle: receiptHandle,
    });

    return this.sqs.send(new DeleteMessageCommand(params));
  }

  /**
   * ********************************************************************************************************************************************
   * Manage Queue Operations
   * ********************************************************************************************************************************************
   */

  /**
   * purgeQueue
   * 
   * Purge all messages from an SQS queue
   * 
   * @param {string} queueUrl 
   * @returns {Promise<{}>}
   */
  async purgeQueue(queueUrl: string): Promise<PurgeQueueCommandOutput> {
    const params: PurgeQueueCommandInput = {
      QueueUrl: queueUrl,
    };

    // Logger message
    global.logger.warn("Purging SQS queue (data).", {
      filePath: __filename,
      methodName: this.purgeQueue.name,
      queueUrl: queueUrl,
    });

    return this.sqs.send(new PurgeQueueCommand(params));
  }

  /**
   * getQueueUrl
   * 
   * Get the URL of an SQS queue
   * 
   * @param {string} queueName 
   * @returns {Promise<string>}
   */
  async getQueueUrl(queueName: string): Promise<string> {
    const params: GetQueueUrlCommandInput = {
      QueueName: queueName,
    };

    // Logger message
    global.logger.info("Getting SQS queue URL (data).", {
      filePath: __filename,
      methodName: this.getQueueUrl.name,
      queueName: queueName,
    });

    const result = await this.sqs.send(new GetQueueUrlCommand(params));
    if (!result.QueueUrl) {
      throw new Error(`Queue URL not found for queue name: ${queueName}`);
    }
    return result.QueueUrl;
  }

  /**
   * createQueue
   * 
   * Create a new SQS queue
   * 
   * @param {string} queueName 
   * @param {AWS.SQS.CreateQueueRequest["Attributes"]} [attributes] 
   * @returns {Promise<AWS.SQS.CreateQueueResult>}
   */
  async createQueue(queueName: string, attributes?: Record<string, string>): Promise<CreateQueueCommandOutput> {
    const params: CreateQueueCommandInput = {
      QueueName: queueName,
      Attributes: attributes,
    };

    // Logger message
    global.logger.info("Creating new SQS queue (data).", {
      filePath: __filename,
      methodName: this.createQueue.name,
      queueName: queueName,
      attributes: attributes,
    });

    return this.sqs.send(new CreateQueueCommand(params));
  }
}

export { AwsSqsClientLibrary }