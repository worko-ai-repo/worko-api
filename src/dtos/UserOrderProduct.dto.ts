// Import the Enums
import { UserOrderProductContextTypeEnum } from "../enums/UserOrderProduct.enum";

/**
 * UserOrderProductCreateRequestDTO
 * 
 * Data Transfer Object (DTO) for creating a user order product request. (Request)
 */
export interface UserOrderProductCreateRequestDTO {
    productContext: UserOrderProductContextTypeEnum; // The context type of the product.
    productContextId: string; // The unique identifier of the product context.
    productContextDetails: Record<string, any>; // Additional details related to the product context.
    unitPrice: number; // The unit price of the product.
    quantity: number; // The quantity of the product.
    totalAmount: number; // The total amount of the product.
}

/**
 * UserOrderProductCreateDTO
 * 
 * Data Transfer Object (DTO) for creating a user order product.
 * Extends UserOrderProductCreateRequestDTO. (Internal)
 */
export interface UserOrderProductCreateDTO extends UserOrderProductCreateRequestDTO {
    orderId: string;
}