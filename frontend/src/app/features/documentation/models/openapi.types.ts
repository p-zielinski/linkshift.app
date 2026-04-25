export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export type OpenApiReferenceObject = {
  $ref: string;
};

export type OpenApiSchemaObject = {
  type?: string | string[];
  title?: string;
  description?: string;
  format?: string;
  default?: unknown;
  example?: unknown;
  examples?: unknown[];
  enum?: unknown[];
  nullable?: boolean;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  required?: string[];
  properties?: Record<string, OpenApiSchemaObject | OpenApiReferenceObject>;
  additionalProperties?:
    | boolean
    | OpenApiSchemaObject
    | OpenApiReferenceObject;
  items?: OpenApiSchemaObject | OpenApiReferenceObject;
  allOf?: Array<OpenApiSchemaObject | OpenApiReferenceObject>;
  anyOf?: Array<OpenApiSchemaObject | OpenApiReferenceObject>;
  oneOf?: Array<OpenApiSchemaObject | OpenApiReferenceObject>;
  not?: OpenApiSchemaObject | OpenApiReferenceObject;
  const?: unknown;
};

export type OpenApiMediaTypeObject = {
  schema?: OpenApiSchemaObject | OpenApiReferenceObject;
  example?: unknown;
  examples?: Record<string, unknown>;
};

export type OpenApiRequestBodyObject = {
  description?: string;
  required?: boolean;
  content?: Record<string, OpenApiMediaTypeObject>;
};

export type OpenApiParameterObject = {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OpenApiSchemaObject | OpenApiReferenceObject;
  example?: unknown;
};

export type OpenApiResponseObject = {
  description?: string;
  content?: Record<string, OpenApiMediaTypeObject>;
};

export type OpenApiSecuritySchemeObject = {
  type: string;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
};

export type OpenApiOperationObject = {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  security?: OpenApiSecurityRequirement[];
  parameters?: Array<OpenApiParameterObject | OpenApiReferenceObject>;
  requestBody?: OpenApiRequestBodyObject | OpenApiReferenceObject;
  responses?: Record<string, OpenApiResponseObject | OpenApiReferenceObject>;
};

export type OpenApiPathItemObject = {
  parameters?: Array<OpenApiParameterObject | OpenApiReferenceObject>;
} & Partial<Record<HttpMethod, OpenApiOperationObject>>;

export type OpenApiSecurityRequirement = Record<string, string[]>;

export type OpenApiDocument = {
  openapi: string;
  info?: {
    title?: string;
    version?: string;
    summary?: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  security?: OpenApiSecurityRequirement[];
  tags?: Array<{ name: string; description?: string }>;
  paths?: Record<string, OpenApiPathItemObject>;
  components?: {
    schemas?: Record<string, OpenApiSchemaObject>;
    parameters?: Record<string, OpenApiParameterObject>;
    requestBodies?: Record<string, OpenApiRequestBodyObject>;
    responses?: Record<string, OpenApiResponseObject>;
    securitySchemes?: Record<string, OpenApiSecuritySchemeObject>;
  };
};

export type OpenApiEndpoint = {
  id: string;
  operationId: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  deprecated: boolean;
  parameters: OpenApiParameterObject[];
  requestBody: OpenApiRequestBodyObject | null;
  responses: Array<{
    statusCode: string;
    response: OpenApiResponseObject;
  }>;
  security: OpenApiSecurityRequirement[];
};

export type OpenApiTagGroup = {
  tag: string;
  description: string;
  endpoints: OpenApiEndpoint[];
};
