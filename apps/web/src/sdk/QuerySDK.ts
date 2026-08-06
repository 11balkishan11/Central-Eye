import type { Transport } from '../transport';

export interface ExecuteQueryRequest {
  query_id: string;
  filters: any[];
}

export interface QueryResponse {
  data: any[];
}

export class QuerySDK {
  transport: Transport;

  constructor(transport: Transport) {
    this.transport = transport;
  }

  async executeQuery(queryId: string, filters: any[] = []): Promise<QueryResponse> {
    const req: ExecuteQueryRequest = { query_id: queryId, filters };
    return this.transport.request<QueryResponse>('/api/v1/query', {
      method: 'POST',
      body: req,
    });
  }
}
