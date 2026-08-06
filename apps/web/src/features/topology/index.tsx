import type { Feature } from '../../runtime/FeatureRegistry';
import { createGraphStore } from './runtime/GraphStore';
import { TopologyCanvas } from './adapter/TopologyCanvas';
import { DagreLayout } from './runtime/LayoutEngine';
import type { GraphNode } from './runtime/models';
import { RenderScheduler } from './runtime/RenderScheduler';

export const graphStore = createGraphStore();
export const scheduler = new RenderScheduler(graphStore);

const TopologyView = () => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Topology</h2>
        <div className="flex space-x-2">
           <div className="text-xs bg-muted px-2 py-1 rounded">Nodes: {graphStore.getState().data.nodes.length}</div>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        <TopologyCanvas />
      </div>
    </div>
  );
};

export const TopologyFeature: Feature = {
  id: 'topology',
  name: 'Topology',
  routes: [
    {
      path: '/topology',
      component: TopologyView,
      title: 'Topology'
    }
  ],
  initialize: (runtime: any) => {
    // Register store at boot time, avoiding circular module dependency
    runtime.storeRegistry.register('topology', graphStore);

    // Mock initialization for testing
    setTimeout(() => {
      const nodes: GraphNode[] = Array.from({ length: 1000 }).map((_, i) => ({
        id: `n${i}`,
        metadata: {
          id: `n${i}`,
          type: i % 10 === 0 ? 'Router' : 'Switch',
          layer: 'Network',
          labels: { name: `Device ${i}` },
          properties: { ip: `10.0.${Math.floor(i/255)}.${i%255}` }
        },
        render: {
          x: 0, y: 0,
          selected: false,
          highlighted: false,
          expanded: false,
          hidden: false,
          pinned: false
        }
      }));

      const edges = [];
      for (let i = 1; i < 1000; i++) {
        edges.push({
          id: `e${i}`,
          source: `n${Math.floor(i/2)}`,
          target: `n${i}`,
          type: 'link',
          labels: {},
          hidden: false
        });
      }

      graphStore.getState().applySnapshot({ nodes, edges, groups: [] });

      const layout = new DagreLayout();
      const patches = layout.compute(graphStore.getState().data);
      scheduler.schedule(patches);
    }, 1000);
  }
};
