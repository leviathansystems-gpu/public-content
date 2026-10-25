export interface ResourceSummary {
  id: string;
  kind: "article" | "service";
  title: string;
  canonical: string;
  markdown_url?: string;
  last_updated?: string;
}
export interface ResourcePage {
  apiVersion: "1";
  items: ResourceSummary[];
  total: number;
  limit: number;
  has_more: boolean;
  next_cursor: string | null;
  next: string | null;
}
export interface ResourceDocument extends ResourceSummary {
  markdown: string | null;
  note?: string;
}
export interface CompanyProfile {
  title: string;
  description: string;
  canonical: string;
  lastUpdated: string;
  markdown: string;
}
export interface SearchOptions {
  q?: string;
  kind?: "article" | "service";
  limit?: number;
  cursor?: string;
}
export interface ClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
}
export class LeviathanAPIError extends Error {
  constructor(message: string, options?: {status?: number; code?: string; retryAfter?: string | null});
  status: number;
  code: string;
  retryAfter: string | null;
}
export class LeviathanClient {
  constructor(options?: ClientOptions);
  listResources(options?: SearchOptions): Promise<ResourcePage>;
  resourcePages(options?: SearchOptions): AsyncGenerator<ResourcePage, void, unknown>;
  readResource(id: string): Promise<ResourceDocument>;
  companyProfile(): Promise<CompanyProfile>;
  request(path: string): Promise<Record<string, unknown>>;
}
