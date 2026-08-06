export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface Transport {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}

export class HttpTransport implements Transport {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body } = options;
    
    // Auth token integration point
    const token = localStorage.getItem('token');
    const requestHeaders = new Headers(headers);
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
    if (body) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
