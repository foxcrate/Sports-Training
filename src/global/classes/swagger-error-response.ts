import { I18nService } from 'nestjs-i18n';
const messages = require('../../i18n/en/errors.json');

class SwaggerErrorResponse {
  type: string;
  message: string;
  description: string;
  constructor(type, description = null) {
    this.type = type;
    this.message = messages[type];
    this.description = description;
  }
  // Method to get the response object
  init() {
    return {
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            example: this.type,
          },

          message: {
            type: 'string',
            example: this.message,
          },
        },
      },
    };
  }
}

export { SwaggerErrorResponse };
