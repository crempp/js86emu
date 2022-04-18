/**
 * https://en.wikipedia.org/wiki/Intel_8237
 *
 * 0000-001F ----	DMA 1	(first Direct Memory Access controller 8237)
 *
 * 0000	r/w	DMA channel 0  address	byte  0, then byte 1.
 * 0001	r/w	DMA channel 0 word count byte 0, then byte 1.
 * 0002	r/w	DMA channel 1  address	byte  0, then byte 1.
 * 0003	r/w	DMA channel 1 word count byte 0, then byte 1.
 * 0004	r/w	DMA channel 2  address	byte  0, then byte 1.
 * 0005	r/w	DMA channel 2 word count byte 0, then byte 1.
 * 0006	r/w	DMA channel 3  address	byte  0, then byte 1.
 * 0007	r/w	DMA channel 3 word count byte 0, then byte 1.
 *
 * 0008	r	DMA channel 0-3 status registerPort
 *     bit 7 = 1  channel 3 request
 *     bit 6 = 1  channel 2 request
 *     bit 5 = 1  channel 1 request
 *     bit 4 = 1  channel 0 request
 *     bit 3 = 1  channel terminal count on channel 3
 *     bit 2 = 1  channel terminal count on channel 2
 *     bit 1 = 1  channel terminal count on channel 1
 *     bit 0 = 1  channel terminal count on channel 0
 *
 *0008	w	DMA channel 0-3 command registerPort
 *     bit 7 = 1  DACK sense active high
 *           = 0  DACK sense active low
 *     bit 6 = 1  DREQ sense active high
 *           = 0  DREQ sense active low
 *     bit 5 = 1  extended write selection
 *           = 0  late write selection
 *     bit 4 = 1  rotating priority
 *           = 0  fixed priority
 *     bit 3 = 1  compressed timing
 *           = 0  normal timing
 *     bit 2 = 1  enable controller
 *           = 0  enable memory-to-memory
 *
 * 0009	w DMA write request registerPort
 *
 * 000A	r/w	DMA channel 0-3 mask registerPort
 *     bit 7-3 = 0   reserved
 *     bit 2	 = 0   clear mask bit
 *       = 1   set mask bit
 *     bit 1-0 = 00  channel 0 select
 *       = 01  channel 1 select
 *        = 10  channel 2 select
 *        = 11  channel 3 select
 *
 * 000B	w	DMA channel 0-3 mode registerPort
 *      bit 7-6 = 00  demand mode
 *        = 01  single mode
 *        = 10  block mode
 *        = 11  cascade mode
 *      bit 5	 = 0   address increment select
 *        = 1   address decrement select
 *      bit 3-2 = 00  verify operation
 *        = 01  write to memory
 *        = 10  read from memory
 *        = 11  reserved
 *      bit 1-0 = 00  channel 0 select
 *        = 01  channel 1 select
 *        = 10  channel 2 select
 *        = 11  channel 3 select
 *
 * 000C	w	DMA clear byte pointer flip-flop
 * 000D	r	DMA read temporary registerPort
 * 000D	w	DMA master clear
 * 000E	w	DMA clear mask registerPort
 * 000F	w	DMA write mask registerPort
 */
import Device from "./Device";

export default class DMA8237 extends Device{
  constructor (config, system) {
    super(config, system);

    // this.io.registerPort(0x00, 'rw', this.temp);
    // this.io.registerPort(0x01, 'rw', this.temp);
    // this.io.registerPort(0x02, 'rw', this.temp);
    // this.io.registerPort(0x03, 'rw', this.temp);
    // this.io.registerPort(0x04, 'rw', this.temp);
    // this.io.registerPort(0x05, 'rw', this.temp);
    // this.io.registerPort(0x06, 'rw', this.temp);
    // this.io.registerPort(0x07, 'rw', this.temp);
    // this.io.registerPort(0x08, 'rw', this.statusCommandRegister);
    // this.io.registerPort(0x09, 'w',  this.writeRequestRegister);
    // this.io.registerPort(0x0A, 'rw', this.maskRegister);
    // this.io.registerPort(0x0B, 'w',  this.modeRegister);
    // this.io.registerPort(0x0C, 'w',  this.clearFlipFlop);
    // this.io.registerPort(0x0D, 'rw', this.readTempClearMasterRegister);
    // this.io.registerPort(0x0E, 'w',  this.clearMaskRegister);
    // this.io.registerPort(0x0F, 'r',  this.writeMaskRegister);
  }

  boot() {
    console.log(`  BOOT device: ${this.constructor.name}`);
  }

  write(port, value, size) {
    if (this.config.debug) {
      console.log(`  WRITE device: ${this.constructor.name} port: ${port}, value:${value}, size${size}`);
    }
  }

  read(port, size){
    let value = 0xFF;
    if (this.config.debug) {
      console.log(`  READ device: ${this.constructor.name} port: ${port}, value:${value}, size${size}`);
    }
    return value;
  }

  deviceCycle(){
    if (this.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }

  temp () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  statusCommandRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  writeRequestRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  maskRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  modeRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  clearFlipFlop () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  readTempClearMasterRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  clearMaskRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }

  writeMaskRegister () {
    return {
      read: () => {

      },
      write: () => {

      }
    }
  }
}
