export default class RendererNoop {
  constructor () {}

  /**
   * Set the render size
   *
   * @param {number} width Renderer width
   * @param {number} height Renderer height
   */
  setSize(width, height) {}

  /**
   * Render the screen data
   *
   * @param {Uint8Array} screenData The raw screen data
   * @param {number} width
   * @param {number} height
   */
  render (screenData, width, height) {}
}
