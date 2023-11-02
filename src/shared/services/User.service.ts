// Import the PrismaClient for interacting with the database
import { PrismaClient } from "@prisma/client";

// Create an instance of PrismaClient for database operations
const prisma = new PrismaClient();

// Define a service class for user-related operations
class UserService {
  // Method to create a user in the database
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    try {
      // Use Prisma to create a new user with the provided data
      const createdUser = await prisma.candidate.create({
        data: userData,
      });

      return createdUser;
    } catch (error) {
      throw error;
    }
  }
}

// Export an instance of the UserService class
export default new UserService();
