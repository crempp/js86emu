import { loadPNGAsync } from "../utils/Utils";

export default class VideoMDA {
  constructor (system, renderer, config) {
    this.system          = system;
    this.mem8            = system.cpu.mem8;
    this.renderer        = renderer;
    this.config          = config;
    this.verticalSync    = config.video.verticalSync;
    this.memStart        = config.video.memoryStart;
    this.memSize         = config.video.memorySize;
    this.font            = [];

    this.screenWidth     = 720;
    this.screenHeight    = 350;
    this.textModeColumns = 80;
    this.textModeRows    = 25;
    this.use_attribute_bit = false;

    this.fontFiles = [
      {
        "file"       : "mda_cp_437",
        "width"      : null,
        "height"     : null,
        "fontWidth"  : 9,
        "fontHeight" : 14,
        "FG_LIGHT"   : 0xAA,
        "BG_DARK"    : 0x00,
      }
    ];
    this.selectedFont = this.fontFiles[0];

    renderer.setSize(this.screenWidth, this.screenHeight);
  }

  /**
   * Initialize the video card asynchronously.
   *
   * @return {Promise<void>}
   */
  async init () {
    // Load font
    let path = `${this.config.video.fontPath}${this.selectedFont["file"]}.png`;
    let fontImage = await loadPNGAsync(path);
    this.selectedFont["width"] = fontImage.width;
    this.selectedFont["height"] = fontImage.height;
    this.buildFontTable(fontImage.data);
  }

  /**
   * Build the font table for the selected font
   *
   * @param {Uint8Array} fontImage Font image data
   */
  buildFontTable (fontImage) {
    let fontCounter = 0;
    let imageWidth  = this.selectedFont["width"];
    let imageHeight = this.selectedFont["height"];
    let fontsAcross = (imageWidth / this.selectedFont["fontWidth"]);
    let fontsDown   = (imageHeight / this.selectedFont["fontHeight"]);
    this.font = Array(fontsAcross * fontsDown);

    for ( let y = 0; y < fontsDown; y++) {
      for ( let x = 0; x < fontsAcross; x++) {
        let glyph = [];

        // Now loop through the pixels of the font
        for ( let fy = 0; fy < this.selectedFont["fontHeight"]; fy++) {
          // Build an array for this row of the font
          let glyphRow = new Uint8Array(this.selectedFont["fontWidth"]);

          for ( let fx = 0; fx < this.selectedFont["fontWidth"]; fx++) {
            // Calculate the memory offset
            let glyphOffset = ( ((y * this.selectedFont["fontHeight"]) + fy) * imageWidth + ((x * this.selectedFont["fontWidth"]) + fx) ) * 4;

            // The font files should be black & white so we just need
            // to check of one channel has a non-zero value
            if (fontImage[glyphOffset] !== 0) {
              glyphRow[fx] = 0;
            }
            else {
              glyphRow[fx] = 255;
            }
          }
          glyph[fy] = glyphRow;
        }

        this.font[fontCounter] = glyph;
        fontCounter++;
      }
    }
  }

  /**
   * Perform a video screen scan
   */
  scan () {
    let fontWidth = this.selectedFont["fontWidth"];
    let fontHeight = this.selectedFont["fontHeight"];

    let screenData  = new Uint8Array(this.screenWidth * this.screenHeight * 4);

    let attribute_offset;
    if (this.use_attribute_bit) attribute_offset = 2;
    else attribute_offset = 1;

    for ( let r = 0; r < this.textModeRows; r++) {
      for ( let c = 0; c < this.textModeColumns; c++) {
        let memoryOffset = this.memStart + ( (r * this.textModeColumns) + c ) * attribute_offset;

        let glyph = this.font[this.mem8[memoryOffset]];
        // let attr  = this.mem8[memoryOffset + 1];

        // Now loop through the pixels of the font
        for ( let fy = 0; fy < fontHeight; fy++) {
          let glyphRow = glyph[fy];

          for ( let fx = 0; fx < fontWidth; fx++) {
            // Calculate the memory offset
            let screenOffset = ( ((r * fontHeight) + fy) * this.screenWidth + ((c * fontWidth) + fx) ) * 4;

            let value = (0xFF === glyphRow[fx]) ? this.selectedFont["FG_LIGHT"] : this.selectedFont["BG_DARK"];

            screenData[screenOffset]     = value; // Red
            screenData[screenOffset + 1] = value; // Blue
            screenData[screenOffset + 2] = value; // Green
            screenData[screenOffset + 3] = 255;   // Alpha
          }
        }
      }
    }
    this.renderer.render(screenData);
  }

  write(port, value, size) {
    if (this.system.config.debug) {
      console.log(`  WRITE device: ${this.constructor.name} port: ${port}, value:${value}, size${size}`);
    }
  }

  read(){
    if (this.system.config.debug) {
      console.log(`  READ device: ${this.constructor.name} port: ${port}, value:${value}, size${size}`);
    }
    return 0x00;
  }

  deviceCycle(){
    if (this.system.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }
}
