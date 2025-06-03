
// Import dynamoose constants
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import DTOs
import { BlogCreateApiDto, BlogCreateDto, BlogFilterOptions, BlogUpdateApiDto, BlogUpdateDto } from "../dtos/Blog.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse, PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// Import daos
import { blogDaoObj } from "../daos/Blog.dao";

// import models
import { DbBlogDto } from "../db/models/Blog.model";

// Import Utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * BlogService
 *
 * Service for handling Blog related operations
 */
class BlogService {
  /**
   * validateAndCreateBlog
   *
   * Validates and creates a new blog post in the database.
   *
   * @param {string} userId - The id of the user who is creating the blog.
   * @param {BlogCreateApiDto} blogRequestBody - The data required to create a new blog.
   * @returns {Promise<DbBlogDto>} - A promise that resolves to the created blog post details.
   */
  async validateAndCreateBlog(
    userId: string,
    blogRequestBody: BlogCreateApiDto
  ): Promise<DbBlogDto> {
    global.logger.info(`Validate And Create Blog [service]`, {
      methodName: this.validateAndCreateBlog.name,
    });

    // Get blog by title
    const blogByTitle: QueryResponse<DbBlogDto> =
      await blogDaoObj.getBlogByTitle(blogRequestBody.title);
    if (blogByTitle.count) {
      throw new BaseError(
        "The Blog with given title already exists.",
        HttpStatusCode.CONFLICT_409
      );
    }

    // Prepare internal create data
    const blogCreateData: BlogCreateDto = {
      ...blogRequestBody,
      createdByUserId: userId,
    };

    return this.createBlog(blogCreateData);
  }

  /**
   * createBlog
   *
   * Creates a new blog post in the database.
   *
   * @param {BlogCreateDto} blogCreateData - The data required to create a new blog.
   * @returns {Promise<DbBlogDto>} - A promise that resolves to the created blog post details.
   */
  async createBlog(blogCreateData: BlogCreateDto): Promise<DbBlogDto> {
    global.logger.info(`Create Blog [service]`, {
      methodName: this.createBlog.name,
    });

    return blogDaoObj.createBlog(blogCreateData);
  }

  /**
   * getBlogById
   *
   * Retrieves a blog post by its unique identifier.
   *
   * @param {string} id - The unique identifier of the blog post.
   * @returns {Promise<QueryResponse<DbBlogDto>>} - A promise that resolves to the blog post details.
   */
  async getBlogById(id: string): Promise<QueryResponse<DbBlogDto>> {
    global.logger.info(`Get Blog By Id [service]`, {
      methodName: this.getBlogById.name,
      id: id,
    });

    return blogDaoObj.getBlogById(id);
  }

  /**
   * getAllBlogsByFilterOptions
   *
   * Retrieves all blogs matching the specified filter options.
   *
   * @param {BlogFilterOptions} blogsRequestBody - The filter options for retrieving blogs.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbBlogDto[]>>} A promise that resolves to a paginated response containing an array of blog DTOs
   *          and matching conditions.
   */
  async getAllBlogsByFilterOptions(
    blogsRequestBody: BlogFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsInternalResponse<DbBlogDto[]>
  > {
    global.logger.info("Get blogs By filter options [Service]", {
      methodName: this.getAllBlogsByFilterOptions.name,
    });

    // Fetch blogs
    const blogDetails: PaginatedResultsWithMatchingConditionsResponse<DbBlogDto> =
      await blogDaoObj.getAllBlogsByFilterOptions(blogsRequestBody);

    // Extract blogs data
    const { lastKey, count, timesQueried, queriedCount, ...blogData } =
      blogDetails;

    // Convert to array
    const blogDataArray: DbBlogDto[] = Object.values(blogData);

    // If no blogs found, return empty results
    if (!blogDataArray.length) {
      return {
        data: [],
        lastKey,
        count,
        timesQueried,
        queriedCount,
      };
    }

    // Build paginated response
    return {
      data: blogDataArray,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    };
  }

  /**
   * updateBlogById
   *
   * Updates a blog post by its unique identifier.
   *
   * @param {string} id - The unique identifier of the blog post.
   * @param {string} userId - The id of the user who is updating the blog.
   * @param {BlogUpdateApiDto} blogUpdateBody - The data required to update a blog.
   * @returns {Promise<DbBlogDto>} - A promise that resolves to the updated blog post details.
   */
  async updateBlogById(
    id: string,
    userId: string,
    blogUpdateBody: BlogUpdateApiDto
  ): Promise<DbBlogDto> {
    global.logger.info(`Update Blog By Id [service]`, {
      methodName: this.updateBlogById.name,
      id: id,
    });

    // Checke whether blog exists
    const blogDetails: QueryResponse<DbBlogDto> =
      await blogDaoObj.getBlogById(id);
    if (!blogDetails.count) {
      throw new BaseError(
        "The Blog details not found to update.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Prepare internal update data
    const blogUpdateData: BlogUpdateDto = {
      ...blogUpdateBody,
      updatedByUserId: userId,
    };

    return blogDaoObj.updateBlogById(id, blogUpdateData);
  }
}

const blogServiceObj: BlogService = new BlogService();
export { blogServiceObj, BlogService };
