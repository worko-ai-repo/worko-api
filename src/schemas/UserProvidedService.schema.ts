import Joi from "joi";

export const userProvidedServiceDTOValidation = Joi.object({
  masterServiceId: Joi.string()
    .required()
    .message("Master service ID is required"),

  status: Joi.string()
    .valid("active")
    .required()
    .message("Status must be 'active'"),

  serviceScope: Joi.array().items(Joi.string()).required(),

  description: Joi.string()
    .max(256)
    .required()
    .message("Description must be at most 256 characters"),

  durationAndPrices: Joi.object({
    priceId: Joi.string().required().message("Price ID is required"),
    durationInMinutes: Joi.number()
      .required()
      .message("Duration in minutes is required"),
    rate: Joi.number().required().message("Rate is required"),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }).required(),

  views: Joi.array().items(
    Joi.object({
      id: Joi.string().required().message("View ID is required"),
      viewerUserId: Joi.string()
        .required()
        .message("Viewer user ID is required"),
      ipAddress: Joi.string().required().message("IP address is required"),
      createdAt: Joi.date(),
    })
  ),
});

export const userProvidedServiceDTOArrayValidation = Joi.array()
  .items(userProvidedServiceDTOValidation)
  .options({ stripUnknown: true });
