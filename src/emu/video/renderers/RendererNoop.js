import fs from 'fs';

export default class RendererNoop {
  constructor (options) {}

  /**
   * Set the render size
   *
   * @param {number} width Renderer width
   * @param {number} height Renderer height
   */
  setSize(width, height) {

  }

  /**
   * Render the screen data
   *
   * @param {Uint8Array} screenData The raw screen data
   */
  render (screenData, width, height) {}
}
