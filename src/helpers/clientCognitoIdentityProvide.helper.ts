import {
    CognitoIdentityProviderClient,
    AdminAddUserToGroupCommand,
    AdminUpdateUserAttributesCommand,
    AdminConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import APP_CONSTANTS from "../configs/constants.config";

/**
 * @class    
 * 
 * @description
 * This class provides a simplified and structured interface to interact with AWS Cognito services.
 * It encapsulates common operations such as managing users, updating attributes, and assigning users to groups
 * within a specified Cognito User Pool. The class uses environment variables for configuration, ensuring secure and flexible deployment.
 * 
 * Key functionalities include:
 * - Adding users to groups to manage roles and permissions.
 * - Managing user attributes and account status.
 * - Confirming user sign-ups programmatically.
 * 
 * The class leverages the AWS SDK v3 for JavaScript, offering robust and asynchronous interactions with AWS Cognito.
 * 
 * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/index.html | AWS SDK v3 Documentation}
 * @see {@link https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html | Cognito User Pools Guide}
 * 
 * @example
 * const userDetails = await clientCognitoIdentityProviderObj.getCognitoUserDetailsByUserName(userName);
 */

class ClientCognitoIdentityProvider {
    private client: CognitoIdentityProviderClient;
    private userPoolId: string;
    private config: any;

    constructor() {
        if (process.env.APP_STAGE === APP_CONSTANTS.STAGES.LOCAL) {
            global.logger.info("Performing local setup for Cognito Identity Provider client.[HELPER]", {
                filePath: __filename,
                methodName: this.constructor.name,
            });
            this.config = {
                region: process.env.APP_AWS_REGION,
                credentials: {
                    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
                    sessionToken: process.env.APP_AWS_SESSION_TOKEN!,  // Optional for temporary credentials
                }
            }
        }
        else {
            this.config = {
                region: process.env.APP_SLS_REGION,
            }
        }
        // Initialize the Cognito Identity Provider client
        this.client = new CognitoIdentityProviderClient(this.config);
        // Initialize the User Pool ID
        this.userPoolId = process.env.APP_AWS_COGNITO_USER_POOL_ID!;
    }
    /**
     * elevateUserToGroup
     * 
     * Elevates a user to a specific group in Cognito.
     *
     * @param {string} username - The username of the user to elevate.
     * @param {string} groupName - The name of the group to add the user to.
     * 
     * @throws {Error} Throws an error if the operation fails.
     *
     * @example
     * await elevateUserToGroup('user1@xyz.com', 'group1');
     * @example
     * {
     *     "$metadata": {
     *         "httpStatusCode": 200,
     *         "requestId": "767d448f-ad49-4fb6-bdf1-dbeecd96939a",
     *         "attempts": 1,
     *         "totalRetryDelay": 0
     *     }
     * }
     */
    async elevateUserToGroup(username: string, groupName: string) {
        try {
            // Logger
            global.logger.info("Elevating user to group in Cognito. [HELPER]", {
                filePath: __filename,
                methodName: this.elevateUserToGroup.name,
            })

            // Create a new command to add the user to the group
            const addUserToGroup = new AdminAddUserToGroupCommand({
                UserPoolId: this.userPoolId,
                Username: username,
                GroupName: groupName,
            });

            // Send the command to Cognito
            const userDetails = await this.client.send(addUserToGroup);
            global.logger.info("User added to group successfully. [HELPER]", {
                filePath: __filename,
                methodName: this.elevateUserToGroup.name,
            });

            // Return the user details
            return userDetails;
        } catch (error) {
            // Log and skip if some error occoured
            global.logger.warn("Error caught in cognito-idp-action. [HELPER]", {
                filePath: __filename,
                methodName: this.elevateUserToGroup.name,
                error: error,
                username: username,
                groupName: groupName
            });
            return; // Skip further actions
        }
    }

    /**
     * verifyCognitoUser
     * 
     * Verifies a user in Cognito.
     * 
     * @param {string} userName - The username of the user to verify.In Our case It is the email of the user.
     * 
     */
    async verifyCognitoUser(userName: string) {
        // Logger
        global.logger.info("Verifying user in Cognito. [HELPER]", {
            filePath: __filename,
            methodName: this.verifyCognitoUser.name,
        });
        try {
            // Prepare the parameters for the command
            const params = {
                UserPoolId: this.userPoolId, // Your Cognito User Pool ID
                Username: userName,
                UserAttributes: [
                    {
                        Name: "email_verified",
                        Value: "true",
                    },
                ],
            };

            // Create a new command to verify the user
            const command = new AdminUpdateUserAttributesCommand(params);

            // Send the command to verify the user
            const response = await this.client.send(command);
            global.logger.info("User verified successfully. [HELPER]", {
                filePath: __filename,
                methodName: this.verifyCognitoUser.name,
            });

            // Return the response
            return response;
        } catch (error) {
            // Log and skip if some error occoured
            global.logger.warn("Error caught in cognito-idp-action. [HELPER]", {
                filePath: __filename,
                methodName: this.verifyCognitoUser.name,
                error: error,
            });
            return; // Skip further actions
        }
    }

    /**
     * confirmCognitoUserSignup
     * 
     * Confirms the user signup in Cognito.
     * 
     * @param userName  
     */
    async confirmCognitoUserSignup(userName: string) {
        // Logger
        global.logger.info("Confirming user signup in Cognito. [HELPER]", {
            filePath: __filename,
            methodName: this.confirmCognitoUserSignup.name,
        });
        try {
            // Prepare the parameters for the command
            const params = {
                UserPoolId: this.userPoolId, // Your Cognito User Pool ID
                Username: userName,
            };

            // Create a new command to verify the user
            const command = new AdminConfirmSignUpCommand(params);

            // Send the command to verify the user
            const response = await this.client.send(command);
            global.logger.info("User confirmed successfully. [HELPER]", {
                filePath: __filename,
                methodName: this.confirmCognitoUserSignup.name,
            });

            // Return the response
            return response;
        } catch (error) {
            // Log and skip if some error occoured
            global.logger.warn("Error caught in cognito-idp-action. [HELPER]", {
                filePath: __filename,
                methodName: this.confirmCognitoUserSignup.name,
                error: error,
            });
            return; // Skip further actions
        }
    }
}

// Create an instance of the ClientCognitoIdentityProvider class
const clientCognitoIdentityProviderObj = new ClientCognitoIdentityProvider();

// Export the instance and the class
export { clientCognitoIdentityProviderObj, ClientCognitoIdentityProvider };