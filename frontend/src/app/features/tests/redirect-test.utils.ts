import type { RedirectTest, RedirectTestRequestData } from '../../core/models/redirect-test.model';
import type { RedirectSimulationEntry } from '../../core/models/redirect-rule.model';

export const ensureLeadingSlash = (path: string): string => {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

export const buildPathWithQuery = (path: string, query: string): string => {
  const normalizedPath = ensureLeadingSlash(path.trim());
  const trimmedQuery = query.trim().replace(/^\?/, '');
  if (!trimmedQuery) {
    return normalizedPath;
  }
  return `${normalizedPath}?${trimmedQuery}`;
};

export const splitPathWithQuery = (pathWithQuery: string): { path: string; query: string } => {
  if (!pathWithQuery) {
    return { path: '/', query: '' };
  }

  const url = new URL(pathWithQuery, 'http://localhost');
  return {
    path: ensureLeadingSlash(url.pathname),
    query: url.search.replace(/^\?/, '')
  };
};

export const parseQueryString = (
  query: string
): Record<string, string | string[]> => {
  const trimmed = query.trim().replace(/^\?/, '');
  if (!trimmed) {
    return {};
  }

  const params = new URLSearchParams(trimmed);
  const result: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
      return;
    }
    if (Array.isArray(existing)) {
      existing.push(value);
      return;
    }
    result[key] = [existing, value];
  });

  return result;
};

export const stringifyQuery = (
  query?: Record<string, string | string[] | number | boolean>
): string => {
  if (!query || Object.keys(query).length === 0) {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    if (value === null || value === undefined) {
      return;
    }
    params.append(key, String(value));
  });

  return params.toString();
};

export const parseHeadersInput = (input: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  const lines = input.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex <= 0) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!key || !value) {
      return;
    }

    headers[key] = value;
  });

  return headers;
};

export const stringifyHeaders = (headers?: Record<string, string>): string => {
  if (!headers || Object.keys(headers).length === 0) {
    return '';
  }

  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
};

export const buildSimulationEntry = (
  test: RedirectTest
): RedirectSimulationEntry => {
  const { path, query } = splitPathWithQuery(test.pathWithQuery);
  const queryObject = test.requestData?.query ?? parseQueryString(query);

  return {
    domainGroupId: test.domainGroupId,
    hostname: test.requestData?.hostname,
    path,
    method: test.requestData?.method,
    ip: test.requestData?.ip,
    userAgent: test.requestData?.userAgent,
    headers: test.requestData?.headers,
    query: queryObject
  };
};

export const buildRequestData = (
  input: {
    method?: string;
    hostname?: string;
    ip?: string;
    userAgent?: string;
    headers?: string;
    query?: string;
  }
): RedirectTestRequestData => {
  const headers = input.headers ? parseHeadersInput(input.headers) : {};
  const query = input.query ? parseQueryString(input.query) : {};

  const requestData: RedirectTestRequestData = {};

  if (input.method) {
    requestData.method = input.method as RedirectTestRequestData['method'];
  }

  if (input.hostname && input.hostname.trim()) {
    requestData.hostname = input.hostname.trim();
  }

  if (input.ip && input.ip.trim()) {
    requestData.ip = input.ip.trim();
  }

  if (input.userAgent && input.userAgent.trim()) {
    requestData.userAgent = input.userAgent.trim();
  }

  if (Object.keys(headers).length > 0) {
    requestData.headers = headers;
  }

  if (Object.keys(query).length > 0) {
    requestData.query = query;
  }

  return requestData;
};
