declare module 'meilisearch' {
  export class Meilisearch {
    constructor(options: { host: string; apiKey?: string });
    health(): Promise<{ status: string }>;
    index<T = any>(uid: string): {
      updateSettings(settings: any): Promise<any>;
      addDocuments(documents: T[], options?: { primaryKey?: string }): Promise<any>;
      deleteDocument(documentId: string | number): Promise<any>;
      search(
        query?: string,
        options?: {
          filter?: string | string[];
          sort?: string[];
          limit?: number;
          offset?: number;
          [key: string]: any;
        }
      ): Promise<{
        hits: T[];
        estimatedTotalHits?: number;
        totalHits?: number;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  }
}
