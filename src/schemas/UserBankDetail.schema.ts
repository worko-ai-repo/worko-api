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
      accNumber: Joi.string().regex(/^\d+$/).required().messages({
        "any.required": "Account number is required.",
        "string.pattern.base": "Account number must be of digits.",
      }),
      accType: Joi.string().required().messages({
        "any.required": "Account type is required.",
      }),
      status: Joi.string(),
      verifiedAt: Joi.date(),
      timestamps: Joi.object({
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      }),
    })
  ),
  upiIds: Joi.array().items(
    Joi.object({
      upiId: Joi.string().required().messages({
        "any.required": "UPI ID is required.",
      }),
      status: Joi.string(),
      verifiedAt: Joi.date(),
      timestamps: Joi.object({
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      }),
    })
  ),
}).options({ stripUnknown: true });
