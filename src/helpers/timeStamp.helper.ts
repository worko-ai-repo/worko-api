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
        // If timestamps present, update 'updatedAt'.
        item.timestamps.updatedAt = currentTimestamp;
      }
    });
  }
}

// import { marshall } from "@aws-sdk/util-dynamodb";

// /**
//  * Helper class for managing timestamps in data objects.
//  */
// export class TimestampHelper {
//   /**
//    * Adds a 'createdAt' timestamp to each item in the category array if not present.
//    * @param category - The array of items to add timestamps to.
//    */
//   static addTimestampsWithOutUpdatedAt(category: any[]): void {
//     const currentTimestamp = new Date();

//     category.forEach((item) => {
//       if (!item.timestamps) {
//         item.timestamps = {
//           createdAt: currentTimestamp.toISOString(),
//         };
//       }
//     });
//   }

//   /**
//    * Adds or updates 'createdAt' and 'updatedAt' timestamps for each item in the category array.
//    * @param category - The array of items to add or update timestamps for.
//    */
//   static addTimestamps(category: any[]): void {
//     const currentTimestamp = new Date();

//     category.forEach((item) => {
//       if (!item.timestamps) {
//         item.timestamps = {
//           createdAt: currentTimestamp.toISOString(),
//           updatedAt: currentTimestamp.toISOString(),
//         };
//       } else {
//         item.timestamps.updatedAt = currentTimestamp.toISOString();
//       }
//     });
//   }

//   /**
//    * If you need to convert the entire object to a map attribute, you can use marshall function.
//    * @param item - The object to be converted to a DynamoDB map.
//    * @returns The DynamoDB map representation of the object.
//    */
//   static convertToDynamoDBMap(item: any): any {
//     // Use the marshall function with the appropriate option
//     return marshall(item, { convertClassInstanceToMap: true });
//   }
// }
