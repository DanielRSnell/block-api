export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Block Convert API',
    version: '1.0.0',
    description: 'Convert HTML to WordPress blocks and vice versa with multiple provider support'
  },
  servers: [
    {
      url: '/',
      description: 'Current server'
    }
  ],
  tags: [
    {
      name: 'Conversion',
      description: 'HTML to blocks and blocks to HTML conversion'
    },
    {
      name: 'Validation',
      description: 'HTML structure validation'
    },
    {
      name: 'Information', 
      description: 'API information and health checks'
    }
  ],
  paths: {
    '/': {
      get: {
        tags: ['Information'],
        summary: 'Redirect to API documentation',
        responses: {
          302: {
            description: 'Redirect to /api-docs'
          }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Information'],
        summary: 'Health check and API information',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string' },
                    version: { type: 'string' },
                    endpoints: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/debug': {
      get: {
        tags: ['Information'],
        summary: 'System debug information',
        responses: {
          200: {
            description: 'System information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    version: { type: 'string' },
                    timestamp: { type: 'string' },
                    nodeVersion: { type: 'string' },
                    platform: { type: 'string' },
                    uptime: { type: 'number' },
                    env: { type: 'object' },
                    memory: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/convert': {
      post: {
        tags: ['Conversion'],
        summary: 'Convert HTML to WordPress blocks',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['html'],
                properties: {
                  html: {
                    type: 'string',
                    description: 'HTML content to convert',
                    example: '<div class="hero"><h1>Welcome</h1><p>Get started today</p></div>'
                  },
                  provider: {
                    type: 'string',
                    enum: ['greenshift', 'gutenberg', 'generateblocks', 'generate-pro'],
                    default: 'greenshift',
                    description: 'Block provider to use'
                  },
                  options: {
                    type: 'object',
                    properties: {
                      preserveClasses: { type: 'boolean', default: true },
                      preserveIds: { type: 'boolean', default: true },
                      generateUniqueIds: { type: 'boolean', default: true }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'WordPress block markup',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: '<!-- wp:greenshift-blocks/element {"uniqueId":"gs-123"} -->\n<div class="hero"><h1>Welcome</h1></div>\n<!-- /wp:greenshift-blocks/element -->'
                }
              }
            }
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/blocks-to-html': {
      post: {
        tags: ['Conversion'],
        summary: 'Convert WordPress blocks to clean HTML',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['blockMarkup'],
                properties: {
                  blockMarkup: {
                    type: 'string',
                    description: 'WordPress block markup to convert',
                    example: '<!-- wp:greenshift-blocks/element --><div class="hero"><h1>Welcome</h1></div><!-- /wp:greenshift-blocks/element -->'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Clean HTML markup',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: '<div class="hero"><h1>Welcome</h1></div>'
                }
              }
            }
          }
        }
      }
    },
    '/api/validate': {
      post: {
        tags: ['Validation'],
        summary: 'Validate HTML structure',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['html'],
                properties: {
                  html: {
                    type: 'string',
                    example: '<div><h1>Title</h1><p>Content</p></div>'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Validation results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    isValid: { type: 'boolean' },
                    errors: { type: 'array', items: { type: 'string' } },
                    warnings: { type: 'array', items: { type: 'string' } },
                    convertibleElements: { type: 'array', items: { type: 'string' } },
                    unsupportedElements: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/elements': {
      get: {
        tags: ['Information'],
        summary: 'Get supported elements and providers',
        responses: {
          200: {
            description: 'Supported elements information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    supportedProviders: { type: 'array', items: { type: 'string' } },
                    supportedElements: { type: 'object' },
                    conversionOptions: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};