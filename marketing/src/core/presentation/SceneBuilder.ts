import { SceneDefinition } from './SceneDefinition';
import { Graph } from '../graph/Graph';
import { PresentationEngine } from './PresentationEngine';
import { colors } from '../../design/tokens/colors';

/**
 * Scene Builder
 * 
 * Assembles predefined SceneDefinitions. React components will call these 
 * methods based on the OS State, preventing React from having to assemble objects.
 */
export class SceneBuilder {
  
  public static buildArrivalScene(): SceneDefinition {
    return {
      id: 'scene-arrival',
      camera: {
        position: [0, 0, 100],
        target: [0, 0, 0],
        zoom: 1,
        projection: 'perspective',
        transitionDurationMs: 0,
      },
      background: {
        type: 'void',
        primaryColor: colors.background.pure,
        opacity: 1,
        animate: false,
      },
      layers: [], // Empty void
      effects: [],
      interactions: {
        hover: false,
        select: false,
        drag: false,
        zoom: false,
        pan: false,
        inspect: false,
        camera: 'locked',
      }
    };
  }

  public static buildObserveScene(graph: Graph): SceneDefinition {
    // Uses the PresentationEngine to translate the graph into VisualNodes
    const nodes = PresentationEngine.buildVisualNodes(graph);

    return {
      id: 'scene-observe',
      camera: {
        position: [0, 0, 50],
        target: [0, 0, 0],
        zoom: 1.5,
        projection: 'perspective',
        transitionDurationMs: 2000, // Cinematic zoom in
      },
      background: {
        type: 'grid',
        primaryColor: colors.background.surface,
        opacity: 0.5,
        animate: true,
      },
      layers: [
        {
          id: 'layer-topology',
          zIndex: 1,
          visible: true,
          nodes: nodes,
          edges: [], // Would map visual edges here
        }
      ],
      effects: [
        // Example: initial discovery pulse on the whole grid
      ],
      interactions: {
        hover: true,
        select: true,
        drag: false,
        zoom: true,
        pan: true,
        inspect: true,
        camera: 'constrained',
      }
    };
  }
}
