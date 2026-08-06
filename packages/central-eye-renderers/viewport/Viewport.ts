import { Frame } from '../../central-eye-runtime/scene/TransitionEngine';

/**
 * The Viewport Interface
 * 
 * Defines exactly what a Renderer (SVG, Canvas, WebGL) is allowed to do.
 * It is completely stateless. It simply takes a computed mathematical Frame
 * and paints it to the screen.
 */
export interface Viewport {
  /**
   * Called once when the Viewport is mounted into the shell.
   */
  initialize(container: HTMLElement): void;

  /**
   * Called every tick of the RequestAnimationFrame loop.
   * Receives the absolutely calculated Frame from the TransitionEngine.
   */
  render(frame: Frame): void;

  /**
   * Handles resizing of the container gracefully.
   */
  resize(width: number, height: number): void;

  /**
   * Cleanup for unmounting (e.g. destroying WebGL contexts).
   */
  dispose(): void;
}
