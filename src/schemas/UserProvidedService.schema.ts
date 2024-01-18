import Joi from "joi";

export const userProvidedServiceDTOValidation = Joi.object();

export const userProvidedServiceDTOArrayValidation = Joi.array()
  .items()
  .options({ stripUnknown: true });
