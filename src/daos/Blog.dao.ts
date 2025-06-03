
// Import dynamoose packages
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { BlogCreateDto, BlogFilterOptions, BlogUpdateDto } from "../dtos/Blog.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";

// Import enums 
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// Import models
import { BlogModel, DbBlogDto } from "../db/models/Blog.model";

// Import services
import UlidService from "../services/Ulid.service";

/**
 * BlogDao
 *
 * This class is used to handle all the database operations for the Blog model
 */
class BlogDao implements BaseDao {
  modelName: string = "Blog";
  partitianKey: string = "BLOG#";
  sortKeys: { SK_INIT: string } = { SK_INIT: "ID#{id}" };

  /**
   * preparePKAndSKForQuery
   *
   * Prepares the partition key and sort key for a query.
   *
   * @param {string} id - The id of the blog.
   * @returns {{PK: string, SK: string}} - An object containing the partition key and sort key.
   */
  preparePKAndSKForQuery(id: string): {
    PK: string;
    SK: string;
  } {
    return {
      PK: this.partitianKey,
      SK: this.sortKeys.SK_INIT.strtr({ "{id}": id }),
    };
  }

  /**
   * createBlog
   *
   * Creates a new blog post in the database.
   *
   * @param {BlogCreateDto} blogData - The data required to create a new blog.
   * @returns {Promise<DbBlogDto>} - A promise that resolves to the created blog post details.
   */
  async createBlog(blogData: BlogCreateDto): Promise<DbBlogDto> {
    global.logger.info(`Create Blog [DAO]`, {
      methodName: this.createBlog.name,
    });

    const ulidId: string = UlidService.getUlidId();

    const { PK, SK } = this.preparePKAndSKForQuery(ulidId);

    // Prepare data for create
    const blogCreateData = {
      ...blogData,
      PK: PK,
      SK: SK,
      id: ulidId,
    };

    return BlogModel.create(blogCreateData);
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
    global.logger.info(`Get Blog By Id [dao]`, {
      methodName: this.getBlogById.name,
      id: id,
    });

    return BlogModel.query("PK")
      .eq(this.partitianKey)
      .where("SK")
      .eq(this.sortKeys.SK_INIT.strtr({ "{id}": id }))
      .exec();
  }

  /**
   * getBlogByTitle
   *
   * Retrieves a blog post by its title.
   *
   * @param {string} title - The title of the blog post.
   * @returns {Promise<QueryResponse<DbBlogDto>>} - A promise that resolves to the blog post details.
   */
  async getBlogByTitle(title: string): Promise<QueryResponse<DbBlogDto>> {
    global.logger.info(`Get Blog By Title [dao]`, {
      methodName: this.getBlogByTitle.name,
      title: title,
    });

    return BlogModel.query("PK")
      .eq(this.partitianKey)
      .where("SK")
      .beginsWith(this.sortKeys.SK_INIT.strtr({ "{id}": "" }))
      .where("title")
      .eq(title.toLowerCase())
      .exec();
  }

  /**
   * getAllBlogsByFilterOptions
   *
   * Retrieves all blogs matching the specified filter options.
   *
   * @param {BlogFilterOptions} blogRequestBody - The filter options for retrieving blogs.
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbBlogDto>>} A promise that resolves to a paginated response containing an array of blog DTOs
   *          and matching conditions.
   */
  async getAllBlogsByFilterOptions(
    blogRequestBody: BlogFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsResponse<DbBlogDto>> {
    global.logger.info(`Get blogs By filter options [DAO]`, {
      methodName: this.getAllBlogsByFilterOptions.name,
    });

    let query: Query<DbBlogDto> = BlogModel.query("PK")
      .eq(this.partitianKey)
      .where("SK")
      .beginsWith(this.sortKeys.SK_INIT.strtr({ "{id}": "" }))
      .sort(blogRequestBody.sortOrder ?? SortOrderTypeEnum.DESCENDING);

    // Apply title filter if provided
    if (blogRequestBody?.title) {
      query = query
        .where("title")
        .contains(blogRequestBody.title.toLowerCase());
    }

    // Apply status filter if provided
    if (blogRequestBody?.status) {
      query = query.where("status").eq(blogRequestBody.status);
    }

    // Apply date range filter if provided
    if (blogRequestBody?.fromDate || blogRequestBody?.toDate) {
      query = query.and().parenthesis((condition) => {
        if (blogRequestBody?.fromDate) {
          condition = condition.where("createdAt").ge(blogRequestBody.fromDate);
        }
        if (blogRequestBody?.toDate) {
          condition = condition.where("createdAt").le(blogRequestBody.toDate);
        }
        return condition;
      });
    }

    // Apply search text filter if provided
    if (blogRequestBody?.searchText) {
      // Remove trailing and leading spaces from the search text
      const searchTextValue: string = blogRequestBody.searchText;

      query = query.and().parenthesis((condition) => {
        return condition
          .where("title")
          .contains(searchTextValue.toLowerCase())
          .or()
          .where("status")
          .contains(searchTextValue.toUpperCase())
          .or()
          .where("basicDescription")
          .contains(searchTextValue)
          .or()
          .where("detailedDescription")
          .contains(searchTextValue);
      });
    }

    // Execute the query by applying the pagination helper and return the results
    return getPaginatedResultsWithMatchingConditions<
      DbBlogDto,
      BlogFilterOptions
    >(query, blogRequestBody);
  }

  /**
   * updateBlogById
   *
   * Updates a blog post by its unique identifier.
   *
   * @param {string} id - The unique identifier of the blog post.
   * @param {BlogUpdateDto} blogData - The data required to update a blog.
   * @returns {Promise<DbBlogDto>} - A promise that resolves to the updated blog post details.
   */
  async updateBlogById(
    id: string,
    blogData: BlogUpdateDto
  ): Promise<DbBlogDto> {
    global.logger.info(`Update Blog By Id [dao]`, {
      methodName: this.updateBlogById.name,
      id: id,
    });

    return BlogModel.update(this.preparePKAndSKForQuery(id), blogData);
  }
}

const blogDaoObj: BlogDao = new BlogDao();
export { blogDaoObj, BlogDao };
