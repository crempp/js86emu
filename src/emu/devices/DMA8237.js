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
import {PortAccessException} from "../utils/Exceptions";

export default class DMA8237 extends Device{
  constructor (config, system) {
    super(config, system);

    this.DMAChannel0_AddressReg = 0x00; // 0x00
    this.DMAChannel0_WordCntReg = 0x00; // 0x01
    this.DMAChannel1_AddressReg = 0x00; // 0x02
    this.DMAChannel1_WordCntReg = 0x00; // 0x03
    this.DMAChannel2_AddressReg = 0x00; // 0x04
    this.DMAChannel2_WordCntReg = 0x00; // 0x05
    this.DMAChannel2_AddressReg = 0x00; // 0x06
    this.DMAChannel3_WordCntReg = 0x00; // 0x07
    this.DMAStatCmdReg = 0x00;          // 0x08
    this.DMARequestReg = 0x00;          // 0x09
    this.DMAMaskReg = 0x00;             // 0x0A
    this.DMAModeReg = 0x00;             // 0x0B
    this.DMAClearFlipFlopReg = 0x00;    // 0x0C
    this.DMAMasterClearTempReg = 0x00;  // 0x0D
    this.DMAClearMaskReg = 0x00;        // 0x0E
    this.DMAMultipleMaskReg = 0x00;     // 0x0F

    this.DMAChannel2_PageReg = 0x00;    // 0x81
    this.DMAChannel3_PageReg = 0x00;    // 0x82
    this.DMAChannel1_PageReg = 0x00;    // 0x83
  }

  boot() {
    console.log(`  BOOT device: ${this.constructor.name}`);
  }

  write(port, value, size) {
    // 8237 Registers
    switch (port) {
      case 0x00:
        this.DMAChannel0_AddressReg = value & 0xFF;
        break;
      case 0x01:
        this.DMAChannel0_WordCntReg = value & 0xFF;
        break;
      case 0x02:
        this.DMAChannel1_AddressReg = value & 0xFF;
        break;
      case 0x03:
        this.DMAChannel1_WordCntReg = value & 0xFF;
        break;
      case 0x04:
        this.DMAChannel2_AddressReg = value & 0xFF;
        break;
      case 0x05:
        this.DMAChannel2_WordCntReg = value & 0xFF;
        break;
      case 0x06:
        this.DMAChannel2_AddressReg = value & 0xFF;
        break;
      case 0x07:
        this.DMAChannel3_WordCntReg = value & 0xFF;
        break;
      case 0x08:
        this.DMAStatCmdReg = value & 0xFF;
        break;
      case 0x09:
        this.DMARequestReg = value & 0xFF;
        break;
      case 0x0A:
        this.DMAMaskReg = value & 0xFF;
        break;
      case 0x0B:
        this.DMAModeReg = value & 0xFF;
        break;
      case 0x0C:
        this.DMAClearFlipFlopReg = value & 0xFF;
        break;
      case 0x0D:
        this.DMAMasterClearTempReg = value & 0xFF;
        break;
      case 0x0E:
        this.DMAClearMaskReg = value & 0xFF;
        break;
      case 0x0F:
        this.DMAMultipleMaskReg = value & 0xFF;
        break;

      // DMA Page Registers
      //     The Page Registers are write-only registers used to generate
      //     address bits 16 - 19 during a DMA transfer.
      //     Data Bit: 0   1   2   3
      //     Addr Bit: 16  17  18  19
      case 0x81:
        this.DMAChannel2_PageReg = value & 0xF;
        break;
      case 0x82:
        this.DMAChannel3_PageReg = value & 0xF;
        break;
      case 0x83:
        this.DMAChannel1_PageReg = value & 0xF;
        break;

      default:
        throw new PortAccessException("Unhandled port write");
    }
  }

  read(port, size){
    switch (port) {
      case 0x00:
        return this.DMAChannel0_AddressReg;
      case 0x01:
        return this.DMAChannel0_WordCntReg;
      case 0x02:
        return this.DMAChannel1_AddressReg;
      case 0x03:
        return this.DMAChannel1_WordCntReg;
      case 0x04:
        return this.DMAChannel2_AddressReg;
      case 0x05:
        return this.DMAChannel2_WordCntReg;
      case 0x06:
        return this.DMAChannel2_AddressReg;
      case 0x07:
        return this.DMAChannel3_WordCntReg;
      case 0x08:
        return this.DMAStatCmdReg;
      case 0x09:
        throw new PortAccessException("Read from write-only port");
      case 0x0A:
        throw new PortAccessException("Read from write-only port");
      case 0x0B:
        throw new PortAccessException("Read from write-only port");
      case 0x0C:
        throw new PortAccessException("Read from write-only port");
      case 0x0D:
        throw new PortAccessException("Read from write-only port");
      case 0x0E:
        throw new PortAccessException("Read from write-only port");
      case 0x0F:
        throw new PortAccessException("Read from write-only port");

      // DMA Page Registers
      //     Write only
      case 0x81:
        throw new PortAccessException("Read from write-only port");
      case 0x82:
        throw new PortAccessException("Read from write-only port");
      case 0x83:
        throw new PortAccessException("Read from write-only port");

      default:
        throw new PortAccessException("Unhandled port read");
    }
  }

  deviceCycle(){
    if (this.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }
}
