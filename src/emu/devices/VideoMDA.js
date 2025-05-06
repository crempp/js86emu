import { loadPNGAsync } from "../utils/Utils";
import Card from "./Card";
import RendererNoop from "../drivers/RendererNoop";
import RendererBin from "../drivers/RendererBin";
import RendererCanvas from "../drivers/RendererCanvas";
import RendererPNG from "../drivers/RendererPNG";
import {SystemConfigException} from "../utils/Exceptions";

export const HORIZONTAL_TOTAL      = 0;
export const HORIZONTAL_DISPLAYED  = 1;
export const HSYNC_POSITION        = 2;
export const HSYNC_WIDTH           = 3;
export const VERTICAL_TOTAL        = 4;
export const VERTICAL_ADJUST       = 5;
export const VERTICAL_DISPLAYED    = 6;
export const VSYNC_POSITION        = 7;
export const INTERLACE_MODE        = 7;
export const MAX_SCAN_LINE_ADDRESS = 8;
export const CURSOR_START          = 10;
export const CURSOR_END            = 11;
export const START_ADDRESS_H       = 12;
export const START_ADDRESS_L       = 13;
export const CURSOR_H              = 14;
export const CURSOR_L              = 15;

export default class VideoMDA extends Card{
  constructor(config, system) {
    super(config, system);

    this.mem8            = system.cpu.mem8;
    this.renderer        = null;
    this.config          = config;
    // this.verticalSync    = config.video.verticalSync;
    this.memStart        = config.video.memoryStart;
    this.memSize         = config.video.memorySize;
    this.font            = [];

    this.screenWidth     = 720;
    this.screenHeight    = 350;
    this.textModeColumns = 80;
    this.textModeRows    = 25;
    this.use_attribute_bit = false;

    // 6845 index/data registers
    this.CRTCIndexRegister = 0x00;
    this.CRTCDataRegister = 0x00;

    // Registers internal to the 6845 and accessed through the index/data
    // registers. Most of these are not needed for emulation but let's
    // keep them around for fun.
    this.CRTCInternalRegisters = [];
    this.CRTCInternalRegisters[HORIZONTAL_TOTAL]      = 0x00;
    this.CRTCInternalRegisters[HORIZONTAL_DISPLAYED]  = 0x00;
    this.CRTCInternalRegisters[HSYNC_POSITION]        = 0x00;
    this.CRTCInternalRegisters[HSYNC_WIDTH]           = 0x00;
    this.CRTCInternalRegisters[VERTICAL_TOTAL]        = 0x00;
    this.CRTCInternalRegisters[VERTICAL_ADJUST]       = 0x00;
    this.CRTCInternalRegisters[VERTICAL_DISPLAYED]    = 0x00;
    this.CRTCInternalRegisters[VSYNC_POSITION]        = 0x00;
    this.CRTCInternalRegisters[INTERLACE_MODE]        = 0x00;
    this.CRTCInternalRegisters[MAX_SCAN_LINE_ADDRESS] = 0x00;
    this.CRTCInternalRegisters[CURSOR_START]          = 0x00;
    this.CRTCInternalRegisters[CURSOR_END]            = 0x00;
    this.CRTCInternalRegisters[START_ADDRESS_H]       = 0x00;
    this.CRTCInternalRegisters[START_ADDRESS_L]       = 0x00;
    this.CRTCInternalRegisters[CURSOR_H]              = 0x00;
    this.CRTCInternalRegisters[CURSOR_L]              = 0x00;

    // These registers are separate LS chips on the card
    this.modeControlRegister   = 0x00; // U58
    this.statusRegister        = 0x00; // I think U29

    // Control lines
    this.highResolutionMode = false;
    this.videoEnabled = false;
    this.blinkEnabled = false;

    // Status lines
    this.horizontalDrive = 0;
    this.BWVideo         = 0;


    this.AVAILABLE_RENDERERS = {
      "RendererNoop":   RendererNoop,
      "RendererBin":    RendererBin,
      "RendererCanvas": RendererCanvas,
      "RendererPNG":    RendererPNG,
    };

    // TODO: Move this to a config/definition file
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

    // Create video and renderer
    if (this.config.isNode && this.config.renderer.class === "RendererCanvas") {
      throw new SystemConfigException("RendererCanvas is not a valid renderer when running in nodejs");
    }
    if (!(this.config.renderer.class in this.AVAILABLE_RENDERERS)) {
      throw new SystemConfigException(`${config.renderer.class} is not a valid renderer`);
    }
    this.renderer = new this.AVAILABLE_RENDERERS[config.renderer.class](config.renderer.options);
    this.renderer.setSize(this.screenWidth, this.screenHeight);
  }

  boot() {}

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
    switch (port) {
      // All the following ports decode to 0x3B4
      case 0x3B0:
      case 0x3B2:
      case 0x3B6:
      case 0x3B4: // Index (Address) Register
        this.CRTCIndexRegister = value & 0xFF;
        break;
      // All the following ports decode to 0x3B5
      case 0x3B1:
      case 0x3B3:
      case 0x3B7:
      case 0x3B5: // Data Register
        this.CRTCDataRegister = value & 0xFF;
        this.CRTCInternalRegisters[this.CRTCIndexRegister] = value;
        break;
      case 0x3B8: // 6845 Mode Control Register
        this.highResolutionMode = value & 0x01;        // bit 0
        this.videoEnabled       = (value >> 3) & 0x01; // bit 3
        this.blinkEnabled       = (value >> 3) & 0x01; // bit 5
        break;
      case 0x3B9: // reserved for color select register on color adapter
        break;
      case 0x3BA: // Status Register (read only)
        break;
      case 0x3BB: // reserved for light pen strobe reset
        break;
    }
  }

  read(port, size){
    switch (port) {
      // All the following ports decode to 0x3B4
      case 0x3B0:
      case 0x3B2:
      case 0x3B6:
      case 0x3B4: // Index (Address) Register (write only)
        break;
      // All the following ports decode to 0x3B5
      case 0x3B1:
      case 0x3B3:
      case 0x3B7:
      case 0x3B5: // Data Register
        // Only registers 14, 15, 16 and 17 are readable
        if (this.CRTCIndexRegister >= 14 && this.CRTCIndexRegister <= 17 ) {
          return this.CRTCInternalRegisters[this.CRTCIndexRegister];
        }
        break;
      case 0x3B8: // 6845 Mode Control Register
        return this.modeControlRegister;
      case 0x3B9: // reserved for color select register on color adapter
        break;
      case 0x3BA: // Status Register (read only)
        return this.statusRegister;
      case 0x3BB: // reserved for light pen strobe reset
        break;
    }
  }

  deviceCycle(){
    let videoSyncCycles = this.system.clock.videoSyncCycles;

    // todo: convert to timer
    if (videoSyncCycles !== 0 && this.system.clock.cycles % videoSyncCycles === 0) {
      this.scan();
    }
  }
}
