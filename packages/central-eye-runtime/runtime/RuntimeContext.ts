import { Clock } from './Clock';
import { EventBus } from '../events/EventBus';
import { CommandBus } from '../commands/CommandBus';
import { Graph } from '../graph/Graph';
import { GraphQueryAPI } from '../graph/GraphQueryAPI';

/**
 * RuntimeContext
 * 
 * The absolute core of the OS. Engines and plugins no longer import
 * random singletons. They are provided this context at initialization.
 */
export interface RuntimeContext {
  clock: Clock;
  events: EventBus;
  commands: CommandBus;
  graph: Graph;
  query: GraphQueryAPI;
  
  // Future expansions
  // config: RuntimeConfig;
  // diagnostics: DiagnosticsManager;
}

export class RuntimeEnvironment {
  private static instance: RuntimeContext;

  public static initialize(): RuntimeContext {
    const graph = new Graph();
    RuntimeEnvironment.instance = {
      clock: new Clock(),
      events: new EventBus(),
      commands: new CommandBus(),
      graph: graph,
      query: new GraphQueryAPI(graph),
    };
    return RuntimeEnvironment.instance;
  }

  public static get(): RuntimeContext {
    if (!RuntimeEnvironment.instance) {
      throw new Error('[RuntimeContext] OS has not been initialized.');
    }
    return RuntimeEnvironment.instance;
  }
}
