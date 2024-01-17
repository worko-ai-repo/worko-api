/**
 * Helper class for managing timestamps in data objects.
 */
export class TimestampHelper {
  /**
   * Adds a 'createdAt' timestamp to each item in the category array if not present.
   * @param category - The array of items to add timestamps to.
   */
  static addTimestampsWithOutUpdatedAt(category: any[]): void {
    const currentTimestamp = new Date().toISOString();

    category.forEach((item) => {
      if (!item.timestamps) {
        // If timestamps not present, add 'createdAt'.
        item.timestamps = {
          createdAt: currentTimestamp,
        };
      }
    });
  }

  /**
   * Updates an 'UpdatedAt' timestamp for each item in the category array if not present.
   * @param category - The array of items to add timestamps to.
   */
  static updateTimestampsForUpdatedAt(category: any[]): void {
    const currentTimestamp = new Date().toISOString();

    category.forEach((item) => {
      if (item.timestamps) {
        // If timestamps is present, update 'UpdatedAt'.
        item.timestamps.UpdatedAt = currentTimestamp;
      }
    });
  }

  /**
   * Adds or updates 'createdAt' and 'updatedAt' timestamps for each item in the category array.
   * @param category - The array of items to add or update timestamps for.
   */
  static addTimestamps(category: any[]): void {
    const currentTimestamp = new Date().toISOString();

    category.forEach((item) => {
      if (!item.timestamps) {
        // If timestamps not present, add 'createdAt' and 'updatedAt'.
        item.timestamps = {
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        };
      } else {
        item.timestamps.createdAt = item.timestamps.createdAt.toISOString();
        // If timestamps present, update 'updatedAt'.
        item.timestamps.updatedAt = currentTimestamp;
      }
    });
  }
}
