
// Import client sns v3 types
import { SNSClient, PublishCommand, SNSClientConfig, PublishCommandOutput, PublishCommandInput } from "@aws-sdk/client-sns";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

class AwsClientSnsLibrary {
  private initClientSnsOptions(): SNSClientConfig {
    let clientSnsOptions: SNSClientConfig;

    /**
     * @todo: Test and write the code for the "local" environment.
     */
    if (process.env.APP_STAGE == APP_CONSTANTS.STAGES.LOCAL) {
      clientSnsOptions = {
        region: process.env.APP_AWS_REGION,
      };

      return clientSnsOptions;
    }

    clientSnsOptions = {
      region: process.env.APP_AWS_REGION,
    };

    return clientSnsOptions;
  }

  private readonly clientSns = new SNSClient(this.initClientSnsOptions());

  /**
   * sendSms
   *
   * Sends an SMS using AWS SNS service.
   *
   * Publish Command Input documentation
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-sns/Interface/PublishCommandInput/
   *
   * Publish documentation
   * @see https://docs.aws.amazon.com/sns/latest/api/API_Publish.html
   *
   * Errors
   * @see https://docs.aws.amazon.com/sns/latest/api/API_Publish.html#API_Publish_Errors
   *
   * @param {PublishCommandInput} input - The input that needs to be passed to the PublishCommand.
   * @returns {Promise<{ messageId: string | undefined }>} 
   */
  async sendSms(input: PublishCommandInput): Promise<{ messageId: string | undefined }> {
    try {
      global.logger.info("Sending SMS using AWS SNS [library]", {
        methodName: this.sendSms.name,
        input: input,
      });

      const command: PublishCommand = new PublishCommand(input);

      /*
      // Sample Success Response:-
      {
        "$metadata": {
          "attempts": 1,
          "httpStatusCode": 200,
          "requestId": "51849f9d-25f8-5ffc-ab92-febdec074edc",
          "totalRetryDelay": 0
        },
        "MessageId": "bb98e36d-a0d5-5b61-8d0e-824d692a6a41"
      }
      */
      const response: PublishCommandOutput = await this.clientSns.send(command);
      global.logger.info("SMS sent successfully", { response: response });

      if(!response.MessageId) {
        return {
          messageId: undefined,
        }
      }

      return {
        messageId: response.MessageId,
      };
    } catch (error) {
      global.logger.error("Error in sending SMS", {
        error: error,
        methodName: this.sendSms.name,
        input: input,
      });

      return {
        messageId: undefined,
      };
    }
  }
}

export { AwsClientSnsLibrary };
