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
      '/webhooks/inbound': {
        post: {
          summary: 'Inbound Webhook Verification',
          description: 'Verifies the signature of inbound webhooks from integrations.',
          tags: ['Webhooks'],
          parameters: [
            {
              name: 'integration',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'nexpress-signature',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Dynamic payload from the integration provider.',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Webhook verified and accepted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', enum: [true] },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request (missing integration or invalid JSON)',
            },
            '401': {
              description: 'Unauthorized (invalid signature or missing secret)',
            },
            '404': {
              description: 'Integration not found or inactive',
            },
          },
        },
      },
      '/search': {
        get: {
          summary: 'Public content search',
          description:
            'Returns safe projections of published content. ' +
            'Anonymous users see only public-access documents. ' +
            'Authenticated members also see members-only documents. ' +
            'Draft content is never returned. ' +
            'Query inputs are validated and length-limited. ' +
            'Pagination is bounded to 50 results per page.',
          tags: ['Search'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: false,
              schema: { type: 'string', maxLength: 200 },
              description: 'Free-text search query (max 200 chars).',
            },
            {
              name: 'type',
              in: 'query',
              required: false,
              schema: { type: 'string', enum: ['page', 'post'] },
              description: 'Filter by content type.',
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            },
          ],
          responses: {
            '200': {
              description: 'Search results',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', enum: [true] },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            type: { type: 'string', enum: ['page', 'post'] },
                            title: { type: 'string' },
                            slug: { type: 'string' },
                            excerpt: { type: 'string' },
                            publishedAt: { type: 'string', format: 'date-time' },
                            accessLevel: { type: 'string', enum: ['public', 'members-only'] },
                          },
                        },
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          hasNextPage: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/analytics/summary': {
        get: {
          summary: 'Analytics aggregate summary',
          description:
            'Returns aggregated event counts by event name. ' +
            'Admin-only. Never returns raw event data or PII. ' +
            'Requires analytics:read or analytics:admin permission.',
          tags: ['Analytics'],
          security: [{ adminAuth: [] }],
          parameters: [
            {
              name: 'since',
              in: 'query',
              required: false,
              schema: { type: 'string', format: 'date-time' },
              description: 'ISO 8601 datetime — only count events after this timestamp.',
            },
          ],
          responses: {
            '200': {
              description: 'Aggregated event counts',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', enum: [true] },
                      data: {
                        type: 'object',
                        additionalProperties: { type: 'integer' },
                        description: 'Map of event name to count.',
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          since: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
            '403': {
              description: 'Forbidden — requires analytics:read or analytics:admin permission',
            },
          },
        },
      },
    },
  };
}
