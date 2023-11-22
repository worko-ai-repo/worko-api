// Define a service class for user-related operations
import { UserModel, USER_CONSTANTS } from "../daos/User.dao";
import UlidService from "../services/Ulid.service";
import UserLinkedinSignUpDTO from "../dtos/User.dto";

class UserService {
  async addUser(userSignUpDTO: UserLinkedinSignUpDTO) {
    try {
      userSignUpDTO.PK = USER_CONSTANTS.PK + "#" + userSignUpDTO.email;
      userSignUpDTO.SK = USER_CONSTANTS.SK_ID + UlidService.getUlidId();
      const result = await UserModel.create(userSignUpDTO);
      console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const PK = USER_CONSTANTS.PK + "#" + email;
      console.log("Before", PK);
      return await UserModel.query("PK").eq(PK).exec();
      // return await UserModel.scan().eq(PK).exec();
      // return result;
    } catch (error) {
      console.log("Error -> ", error);
      throw error;
    }
  }
  // Method to create a user in the database
  // async createUser(userData: {
  //   name: string;
  //   email: string;
  //   password: string;
  // }) {
  //   try {
  //     return {};
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async addUser(userSignUpDTO: UserLinkedinSignUpDTO):Promise<any> {
  //   try {
  //     const { email, name, role } = userSignUpDTO;

  //     // Check if a user with the given email already exists
  //     const existingUser = await UserModel.get({
  //       [USER_CONSTANTS.PK]: `${USER_CONSTANTS.PK}#${email}`,
  //       [USER_CONSTANTS.SORT_KEY]: `${USER_CONSTANTS.SK_ID}`, // This assumes there's only one user per email
  //     });

  //     if (existingUser) {
  //       // User with the email already exists, check if the role exists in the role set
  //       const existingRoles = existingUser[USER_CONSTANTS.ATTR_ROLE_LIST];

  //       if (existingRoles.has(role)) {
  //         return `${role} already exists for this user.`;
  //       }

  //       // Add the new role to the existing role set
  //       existingRoles.add(role);

  //       // Update the user with the new role
  //       await UserModel.update(
  //         {
  //           [USER_CONSTANTS.PK]: existingUser[USER_CONSTANTS.PK],
  //           [USER_CONSTANTS.SORT_KEY]: existingUser[USER_CONSTANTS.SORT_KEY],
  //         },
  //         { [USER_CONSTANTS.ATTR_ROLE_LIST]: existingRoles }
  //       );

  //       // Return the updated user DTO
  //       const updatedUserDTO: UserDTO = {
  //         PK: existingUser[USER_CONSTANTS.PK],
  //         SK: existingUser[USER_CONSTANTS.SORT_KEY],
  //         firstName: existingUser[USER_CONSTANTS.ATTR_FIRST_NAME],
  //         roleList: existingRoles,
  //         // Add other attributes as needed
  //       };

  //       return updatedUserDTO;
  //     }

  //     // If the user doesn't exist, proceed with creating a new user as before

  //     // Generate a new ULID for the user
  //     const userId = UlidService.generateUlid();

  //     // Construct the DynamoDB item
  //     const userItem = {
  //       [USER_CONSTANTS.PK]: `${USER_CONSTANTS.PK}#${email}`,
  //       [USER_CONSTANTS.SORT_KEY]: `${USER_CONSTANTS.SK_ID}${userId}`,
  //       [USER_CONSTANTS.ATTR_FIRST_NAME]: name,
  //       [USER_CONSTANTS.ATTR_ROLE_LIST]: new Set([role]),
  //       // Add other default values as needed for the signup process
  //     };

  //     // Save the user item to DynamoDB
  //     await UserModel.create(userItem);

  //     // Return the created user DTO
  //     const newUserDTO: UserDTO = {
  //       PK: userItem[USER_CONSTANTS.PK],
  //       SK: userItem[USER_CONSTANTS.SORT_KEY],
  //       firstName: userItem[USER_CONSTANTS.ATTR_FIRST_NAME],
  //       roleList: userItem[USER_CONSTANTS.ATTR_ROLE_LIST],
  //       // Add other attributes as needed
  //     };

  //     return newUserDTO;
  //   } catch (error) {
  //     console.error("Error adding user:", error);
  //     return null;
  //   }
  // }
}

// Export an instance of the UserService class
export default new UserService();
