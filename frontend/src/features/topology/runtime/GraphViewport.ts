export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export type ViewportCommand = 
  | { type: 'panTo'; x: number; y: number }
  | { type: 'zoomTo'; zoom: number }
  | { type: 'fitView' }
  | { type: 'centerNode'; nodeId: string };

export type ViewportListener = (cmd: ViewportCommand) => void;

export class GraphViewportRuntime {
  private state: ViewportState = { x: 0, y: 0, zoom: 1 };
  private listeners: ViewportListener[] = [];
  private bookmarks: Map<string, ViewportState> = new Map();

  // Updated by the rendering adapter when user pans/zooms manually
  public syncState(state: ViewportState) {
    this.state = state;
  }

  public getState() {
    return { ...this.state };
  }

  // Logical commands dispatched to the rendering adapter
  public fitView() {
    this.emit({ type: 'fitView' });
  }

  public centerNode(nodeId: string) {
    this.emit({ type: 'centerNode', nodeId });
  }

  public saveBookmark(id: string) {
    this.bookmarks.set(id, { ...this.state });
  }

  public loadBookmark(id: string) {
    const bm = this.bookmarks.get(id);
    if (bm) {
      this.emit({ type: 'panTo', x: bm.x, y: bm.y });
      this.emit({ type: 'zoomTo', zoom: bm.zoom });
    }
  }

  public subscribe(listener: ViewportListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(cmd: ViewportCommand) {
    for (const l of this.listeners) {
      l(cmd);
    }
  }
}
