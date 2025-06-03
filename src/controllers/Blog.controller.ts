// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DTOs
import { PaginatedResultsWithMatchingConditionsInternalResponse, RecordListingResponseDTO } from "../dtos/Common.dto";
import { BlogCreateApiDto, BlogFilterOptions, BlogListingFilterRequestDTO, BlogUpdateApiDto } from "../dtos/Blog.dto";

// import helpers
import { RequestHelper } from "../helpers/request.helper";
import { paginationResponseHelperObj } from "../helpers/pagination-response.helper";

// import models
import { DbBlogDto } from "../db/models/Blog.model";

// Import Services
import { blogServiceObj } from "../services/Blog.service";
import userDetailServiceObj from "../services/UserDetail.service";

// Import Schemas
import { blogCreateApiDtoValidation, blogFilterOptionsValidation, blogUpdateApiDtoValidation } from "../schemas/Blog.schema";

// Import Utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

/**
 * BlogController
 *
 * Controller for handling Blog related operations
 */
class BlogController {
  /**
   * createBlog
   *
   * This function is used to create Blog
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Create Blog [controller]`, {
        methodName: this.createBlog.name,
      });

      const blogRequestBody: BlogCreateApiDto = req.body;

      // Validate the user input and throw a validation error if necessary using the Joi schema
      const { error, value: validatedRequestBody } =
        blogCreateApiDtoValidation.validate(blogRequestBody, {
          abortEarly: false,
        });
      if (error) {
        // Throw the validation error with details
        throw new RequestValidationError(error);
      }

      // Extract the userId from the response locals
      const cognitoUserId: string = global.requestLocalContext.userId;

      // Parse the user details
      await userDetailServiceObj.getUserByIdOne(cognitoUserId);

      const blogDetails: DbBlogDto = await blogServiceObj.validateAndCreateBlog(
        cognitoUserId,
        validatedRequestBody,
      );

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.CREATED_201).json(blogDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getBlogById
   *
   * This function is used to get Blog by id
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getBlogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Get Blog By Id [controller]`, {
        methodName: this.getBlogById.name,
      });

      // Fetch the Blog from the service
      const blogDetails: QueryResponse<DbBlogDto> = await blogServiceObj.getBlogById(req.params.id);

      if(!blogDetails.count) {
        throw new BaseError("The Blog not found.", HttpStatusCode.NOT_FOUND_404);
      }

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(blogDetails);
    } catch (error) {
      next(error);
    }
  };

  /**
   * getAllBlogsByFilterOptions
   *
   * This function is used to get all Blogs by filter options
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getAllBlogsByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get All Blogs By Filter Options [controller]`, {
        methodName: this.getAllBlogsByFilterOptions.name,
      });

      // Parse filter options from the request query parameters
      const blogListingFilterRequest: BlogFilterOptions =
        RequestHelper.parseFilterOptions<
          BlogListingFilterRequestDTO,
          BlogFilterOptions
        >(req.query as unknown as BlogListingFilterRequestDTO);

      // Validate the request using the Joi schema
      const { error: reqBodyError, value: validatedRequestBody } =
        blogFilterOptionsValidation.validate(blogListingFilterRequest, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Get all Blogs using the service - with the correct return type
      const blogDetails: PaginatedResultsWithMatchingConditionsInternalResponse<
        DbBlogDto[]
      > = await blogServiceObj.getAllBlogsByFilterOptions(validatedRequestBody);

      // Extract the response data
      const { lastKey, count, timesQueried, queriedCount, data } = blogDetails;

      // Generate the pagination response
      const blogResponse: RecordListingResponseDTO<DbBlogDto[]> =
        paginationResponseHelperObj.customizedPaginationRecordListingResponse<
          DbBlogDto[],
          BlogFilterOptions
        >(
          data,
          validatedRequestBody as BlogFilterOptions,
          count,
          timesQueried,
          lastKey,
          queriedCount
        );

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(blogResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * updateBlogById
   *
   * This function is used to update Blog by id
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  updateBlogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Update Blog By Id [controller]`, {
        methodName: this.updateBlogById.name,
      });

      // Extract the id from the request parameters
      const blogId: string = req.params.id;

      // Validate the user input and throw a validation error if necessary
      const requestBody: BlogUpdateApiDto = req.body;
      const { error, value: validatedRequestBody } =
        blogUpdateApiDtoValidation.validate(requestBody, {
          abortEarly: false,
        });

      if (error) {
        throw new RequestValidationError(error);
      }

      // Extract the userId from the response locals
      const cognitoUserId: string = global.requestLocalContext.userId;

      // Parse the user details
      await userDetailServiceObj.getUserByIdOne(cognitoUserId);

      // Fetch the Blog from the service
      const blogDetails: DbBlogDto = await blogServiceObj.updateBlogById(
        blogId,
        cognitoUserId,
        validatedRequestBody
      );

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(blogDetails);
    } catch (error) {
      next(error);
    }
  };
}

// Export Default Controller
export default BlogController;