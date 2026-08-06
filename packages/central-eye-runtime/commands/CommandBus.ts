type CommandHandler<T = any> = (payload: T) => void;

/**
 * Command Bus
 * Declares INTENT. Tells the system what it SHOULD do (e.g., 'HighlightDependencies').
 * This separation makes undo/redo and deterministic replay possible.
 */
export class CommandBus {
  private handlers = new Map<string, CommandHandler>();

  public register<T = any>(command: string, handler: CommandHandler<T>): void {
    if (this.handlers.has(command)) {
      console.warn(`[CommandBus] Handler for ${command} is already registered. Overwriting.`);
    }
    this.handlers.set(command, handler);
  }

  public execute<T = any>(command: string, payload?: T): void {
    const handler = this.handlers.get(command);
    if (handler) {
      handler(payload as T);
    } else {
      console.warn(`[CommandBus] No handler registered for command: ${command}`);
    }
  }
}
