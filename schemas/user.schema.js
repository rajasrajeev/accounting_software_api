// schemas/user.schema.js

const Joi = require('joi');

const userSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  username: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('VENDOR', 'CONTRACTOR', 'WAREHOUSE', 'BACKEND').required(),
  last_logged_in: Joi.date().optional(),
  verified: Joi.boolean().default(false),
  verification_code: Joi.string().optional()
});

module.exports = userSchema;
