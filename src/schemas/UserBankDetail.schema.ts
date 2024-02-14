import Joi from "joi";

export const userBankDetailDTOValidation = Joi.object({
  bankDetails: Joi.array().items(
    Joi.object({
      bankName: Joi.string().required().messages({
        "any.required": "Bank name is required.",
      }),
      holderName: Joi.string().required().messages({
        "any.required": "Holder name is required.",
      }),
      ifscCode: Joi.string().required().messages({
        "any.required": "IFSC code is required.",
      }),
      accNumber: Joi.number().integer().required().messages({
        "any.required": "Account number is required.",
        "number.base": "Account number must be a number.",
        "number.integer": "Account number must be an integer."
      }),
      accType: Joi.string().required().messages({
        "any.required": "Account type is required.",
      }),
      status: Joi.string().optional(),
      verifiedAt: Joi.string().isoDate().optional(),
      timestamps: Joi.object({
        createdAt: Joi.string().isoDate().optional(),
        updatedAt: Joi.string().isoDate().optional(),
      }).optional(),
    })
  ),
  upiIds: Joi.array().items(
    Joi.object({
      upiId: Joi.string().required().messages({
        "any.required": "UPI ID is required.",
      }),
      status: Joi.string().optional(),
      verifiedAt: Joi.string().isoDate().optional(),
      timestamps: Joi.object({
        createdAt: Joi.string().isoDate().optional(),
        updatedAt: Joi.string().isoDate().optional(),
      }).optional(),
    })
  ),
}).options({ stripUnknown: true });
