import type { Transport } from '../transport';

export interface ScreenLayoutResponse {
  screen_id: string;
  layout: {
    type: string;
    rows: any[];
  };
  data: Record<string, any>;
}

export class ScreenSDK {
  transport: Transport;

  constructor(transport: Transport) {
    this.transport = transport;
  }

  async getScreen(screenId: string): Promise<ScreenLayoutResponse> {
    return this.transport.request<ScreenLayoutResponse>(`/api/v1/screen/${screenId}`);
  }
}
