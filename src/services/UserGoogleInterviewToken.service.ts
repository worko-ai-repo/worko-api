// Import npm packages
import axios from "axios";

// Import daos
import { userGoogleInterviewTokenDaoObj } from "../daos/UserGoogleInterviewToken.dao";

// Import models
import { DbUserGoogleInterviewTokenDetailsDto } from "../db/gcp-firestore-models/UserGoogleInterviewToken.model";

// Import dtos
import {
  CreateUserGoogleInterviewTokenDetailsDto,
  UserGoogleInterviewAccountDetailsDto,
  UserGoogleInterviewTokenDetailsApiDto,
} from "../dtos/UserGoogleInterviewToken.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";
import { getActionByUserId } from "../helpers/user.helper";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class UserGoogleInterviewTokenService {
  /**
   * getIdentityUserId
   *
   * Resolves the "identity entity" userId for the current request based
   * on the user's role present in `global.requestLocalContext`.
   */
  private getIdentityUserId(): string {
    global.logger.info("Initialized getIdentityUserId [SERVICE]", {
      methodName: this.getIdentityUserId.name,
    });

    const { actionByCorporateUserId, actionByUserId } = getActionByUserId();

    const identityUserId: string | undefined = actionByUserId ?? actionByCorporateUserId;
    if (!identityUserId) {
      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    return identityUserId;
  }

  /**
   * exchangeAuthorizationCodeForTokens
   *
   * Exchanges the provided Google GIS authorization code for access and refresh tokens.
   *
   * @param {string} code
   * @returns {Promise<UserGoogleInterviewAccountDetailsDto>}
   */
  private async exchangeAuthorizationCodeForTokens(
    code: string
  ): Promise<UserGoogleInterviewAccountDetailsDto> {
    global.logger.info(
      "Initialized exchangeAuthorizationCodeForTokens [SERVICE]",
      {
        methodName: this.exchangeAuthorizationCodeForTokens.name,
      }
    );

    const clientId: string | undefined = process.env.APP_GOOGLE_CLIENT_ID;
    const clientSecret: string | undefined = process.env.APP_GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BaseError(
        "Google OAuth client credentials are not configured.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    try {
      const body = new URLSearchParams();
      body.append("code", code);
      body.append("client_id", clientId);
      body.append("client_secret", clientSecret);
      // Use 'postmessage' if using GIS popup
      body.append("redirect_uri", "postmessage");
      body.append("grant_type", "authorization_code");

      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        body.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        scope,
      } = response.data ?? {};

      const expiresInNumber: number | undefined =
        typeof expiresIn === "number"
          ? expiresIn
          : typeof expiresIn === "string"
            ? Number.parseInt(expiresIn, 10)
            : undefined;

      const expiryDate: string | undefined =
        typeof expiresInNumber === "number"
          ? dateHelperObj.getISODateFromTimestamp(Date.now() + expiresInNumber * 1000)
          : undefined;

      if (!accessToken) {
        throw new BaseError(
          "Google token endpoint did not return an access token.",
          HttpStatusCode.BAD_REQUEST_400
        );
      }

      return {
        accessToken,
        refreshToken: refreshToken ?? "",
        expiryDate,
        scope,
      };
    } catch (error) {
      global.logger.error(
        "Error exchanging authorization code for tokens [SERVICE]",
        {
          methodName: this.exchangeAuthorizationCodeForTokens.name,
          error,
        }
      );
      throw new BaseError(
        "Failed to exchange Google authorization code.",
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  }

  /**
   * upsertUserGoogleInterviewTokenDetails
   *
   * Creates or updates the user's token document based on whether it already exists.
   *
   * @param {UserGoogleInterviewTokenDetailsApiDto} requestBody
   */
  private async upsertUserGoogleInterviewTokenDetails(
    requestBody: UserGoogleInterviewTokenDetailsApiDto
  ): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info("Initialized upsertUserGoogleInterviewTokenDetails [SERVICE]", {
      methodName: this.upsertUserGoogleInterviewTokenDetails.name,
    });

    const identityUserId: string = this.getIdentityUserId();

    const existingDoc: DbUserGoogleInterviewTokenDetailsDto | undefined =
      await userGoogleInterviewTokenDaoObj.getUserGoogleInterviewTokenDetailsByUserId(
        identityUserId
      );

    const tokenDetails: UserGoogleInterviewAccountDetailsDto =
      await this.exchangeAuthorizationCodeForTokens(requestBody.code);

    const finalRefreshToken: string | undefined =
      tokenDetails.refreshToken || existingDoc?.hasGoogleInterviewAccountDetails?.refreshToken;

    if (!finalRefreshToken) {
      throw new BaseError(
        "Refresh token is missing. Please re-authenticate with Google and grant offline access.",
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    const finalExpiryDate: string | undefined =
      tokenDetails.expiryDate ?? existingDoc?.hasGoogleInterviewAccountDetails?.expiryDate;

    const finalScope: string | undefined =
      tokenDetails.scope ?? existingDoc?.hasGoogleInterviewAccountDetails?.scope;

    const createDto: CreateUserGoogleInterviewTokenDetailsDto = {
      userId: identityUserId,
      hasGoogleInterviewAccountDetails: {
        accessToken: tokenDetails.accessToken,
        refreshToken: finalRefreshToken,
        expiryDate: finalExpiryDate,
        scope: finalScope,
      },
    };

    if (existingDoc) {
      return userGoogleInterviewTokenDaoObj.updateUserGoogleInterviewTokenDetailsByUserId(
        identityUserId,
        {
          hasGoogleInterviewAccountDetails: createDto.hasGoogleInterviewAccountDetails,
        }
      );
    }

    return userGoogleInterviewTokenDaoObj.createUserGoogleInterviewTokenDetails(createDto);
  }

  /**
   * createUserGoogleInterviewTokenDetails
   *
   * Exchanges the authorization code and creates/updates the token document.
   *
   * @param {UserGoogleInterviewTokenDetailsApiDto} requestBody
   * @returns {Promise<DbUserGoogleInterviewTokenDetailsDto | undefined>}
   */
  async createUserGoogleInterviewTokenDetails(
    requestBody: UserGoogleInterviewTokenDetailsApiDto
  ): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info("Initialized createUserGoogleInterviewTokenDetails [SERVICE]", {
      methodName: this.createUserGoogleInterviewTokenDetails.name,
    });

    return this.upsertUserGoogleInterviewTokenDetails(requestBody);
  }

  /**
   * getUserGoogleInterviewTokenDetailsByUserId
   *
   * @returns {Promise<DbUserGoogleInterviewTokenDetailsDto | undefined>}
   */
  async getUserGoogleInterviewTokenDetailsByUserId(): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info("Initialized getUserGoogleInterviewTokenDetailsByUserId [SERVICE]", {
      methodName: this.getUserGoogleInterviewTokenDetailsByUserId.name,
    });

    const identityUserId: string = this.getIdentityUserId();
    return userGoogleInterviewTokenDaoObj.getUserGoogleInterviewTokenDetailsByUserId(identityUserId);
  }

  /**
   * updateUserGoogleInterviewTokenDetails
   *
   * Exchanges the authorization code and updates the token document.
   *
   * @param {UserGoogleInterviewTokenDetailsApiDto} requestBody
   * @returns {Promise<DbUserGoogleInterviewTokenDetailsDto | undefined>}
   */
  async updateUserGoogleInterviewTokenDetails(
    requestBody: UserGoogleInterviewTokenDetailsApiDto
  ): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info("Initialized updateUserGoogleInterviewTokenDetails [SERVICE]", {
      methodName: this.updateUserGoogleInterviewTokenDetails.name,
    });

    return this.upsertUserGoogleInterviewTokenDetails(requestBody);
  }

  /**
   * deleteUserGoogleInterviewTokenDetailsByUserId
   *
   * @returns {Promise<boolean>}
   */
  async deleteUserGoogleInterviewTokenDetailsByUserId(): Promise<boolean> {
    global.logger.info("Initialized deleteUserGoogleInterviewTokenDetailsByUserId [SERVICE]", {
      methodName: this.deleteUserGoogleInterviewTokenDetailsByUserId.name,
    });

    const identityUserId: string = this.getIdentityUserId();
    return userGoogleInterviewTokenDaoObj.deleteUserGoogleInterviewTokenDetailsByUserId(identityUserId);
  }
}

const userGoogleInterviewTokenServiceObj: UserGoogleInterviewTokenService =
  new UserGoogleInterviewTokenService();

export { userGoogleInterviewTokenServiceObj, UserGoogleInterviewTokenService };

