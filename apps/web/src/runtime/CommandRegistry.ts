import type { CommandConfig } from './FeatureRegistry';

export class CommandRegistry {
  private commands: Map<string, CommandConfig> = new Map();

  register(command: CommandConfig) {
    if (this.commands.has(command.id)) {
      console.warn(`Command ${command.id} is already registered.`);
      return;
    }
    this.commands.set(command.id, command);
  }

  execute(id: string) {
    const cmd = this.commands.get(id);
    if (cmd) {
      cmd.action();
    } else {
      console.warn(`Command ${id} not found.`);
    }
  }

  getAll(): CommandConfig[] {
    return Array.from(this.commands.values());
  }
}
