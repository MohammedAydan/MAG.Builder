export function generateOpenApiDocument() {
  return {
    openapi: '3.1.1',
    info: {
      title: 'NexPress API',
      version: '1.0.0',
      description: 'API for NexPress CMS and Commerce Platform',
    },
    servers: [
      {
        url: '/api',
        description: 'Current Environment',
      },
    ],
    components: {
      securitySchemes: {
        memberAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Member authentication token',
        },
        adminAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Admin/Dashboard authentication token',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
          description: 'API key for programmatic access',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            code: {
              type: 'string',
            },
            details: {},
          },
          required: ['error'],
        },
        ApiSuccess: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              enum: [true],
            },
            data: {},
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
              },
            },
          },
          required: ['success', 'data'],
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Returns the health status of the API.',
          tags: ['System'],
          responses: {
            '200': {
              description: 'Healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/install': {
        post: {
          summary: 'Install platform',
          description: 'Installs the NexPress platform. Fails if already installed.',
          tags: ['System'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    storeName: { type: 'string' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Installation successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request or already installed',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiError',
                  },
                },
              },
            },
          },
        },
      },
      '/forms/{formId}/public': {
        get: {
          summary: 'Get public form definition',
          description: 'Retrieves the public schema for a given form.',
          tags: ['Forms'],
          parameters: [
            {
              name: 'formId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Form definition',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      slug: { type: 'string' },
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Form not found',
            },
          },
        },
      },
      '/forms/{formId}/submit': {
        post: {
          summary: 'Submit form',
          description: 'Submits a payload to the specified form. Includes rate limiting.',
          tags: ['Forms'],
          parameters: [
            {
              name: 'formId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Dynamic payload matching the form schema.',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Submission successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', enum: [true] },
                    },
                  },
                },
              },
            },
            '422': {
              description: 'Validation failed',
            },
            '429': {
              description: 'Rate limit exceeded',
            },
          },
        },
      },
      '/members/me': {
        get: {
          summary: 'Get current member profile',
          tags: ['Members'],
          security: [{ memberAuth: [] }],
          responses: {
            '200': {
              description: 'Member profile',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/commerce/products': {
        get: {
          summary: 'List products',
          description: 'Returns a list of safe public product projections.',
          tags: ['Commerce'],
          responses: {
            '200': {
              description: 'Products list',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
          },
        },
      },
      '/commerce/products/{handle}': {
        get: {
          summary: 'Get product by handle',
          tags: ['Commerce'],
          parameters: [
            {
              name: 'handle',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Product detail',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
            '404': {
              description: 'Product not found',
            },
          },
        },
      },
      '/commerce/cart': {
        get: {
          summary: 'Get current cart',
          tags: ['Commerce'],
          security: [{ memberAuth: [] }],
          responses: {
            '200': {
              description: 'Cart object',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Add to cart',
          tags: ['Commerce'],
          security: [{ memberAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    variantId: { type: 'string' },
                    quantity: { type: 'integer' },
                  },
                  required: ['variantId', 'quantity'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Cart updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
          },
        },
      },
      '/plugins': {
        get: {
          summary: 'List plugins',
          tags: ['Plugins'],
          security: [{ adminAuth: [] }],
          responses: {
            '200': {
              description: 'Plugins list',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/templates': {
        get: {
          summary: 'List templates',
          tags: ['Templates'],
          security: [{ adminAuth: [] }],
          responses: {
            '200': {
              description: 'Templates list',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
    },
  };
}
