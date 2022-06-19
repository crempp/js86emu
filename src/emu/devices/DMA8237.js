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
import {FeatureNotImplementedException, PortAccessException} from "../utils/Exceptions";
import {LSB, MSB} from "../Constants";

const VERIFY_TRANSFER = 0;
const WRITE_TRANSFER  = 1;
const READ_TRANSFER   = 2;
const INC = 0;
const DEC = 1;
const DEMAND  = 0;
const SINGLE  = 1;
const BLOCK   = 2;
const CASCADE = 3;

export default class DMA8237 extends Device{
  constructor (config, system) {
    super(config, system);

    this.channels = [
      {  // Channel 0
        startAddress: 0,
        count: 0,
        masked:                 false,
        maskedDRQ:              false,
        request:                false,
        ctl_TransferType:       VERIFY_TRANSFER,
        ctl_AutoInitialization: false,
        ctl_AddressIncDec:      INC,
        ctl_ModeSelect:         DEMAND,
      },
      {  // Channel 1
        startAddress: 0,
        count: 0,
        masked:                 false,
        maskedDRQ:              false,
        request:                false,
        ctl_TransferType:       VERIFY_TRANSFER,
        ctl_AutoInitialization: false,
        ctl_AddressIncDec:      INC,
        ctl_ModeSelect:         DEMAND,
      },
      {  // Channel 2
        startAddress: 0,
        count: 0,
        masked:                 false,
        maskedDRQ:              false,
        request:                false,
        ctl_TransferType:       VERIFY_TRANSFER,
        ctl_AutoInitialization: false,
        ctl_AddressIncDec:      INC,
        ctl_ModeSelect:         DEMAND,
      },
      {  // Channel 3
        startAddress: 0,
        count: 0,
        masked:                 false,
        maskedDRQ:              false,
        request:                false,
        ctl_TransferType:       VERIFY_TRANSFER,
        ctl_AutoInitialization: false,
        ctl_AddressIncDec:      INC,
        ctl_ModeSelect:         DEMAND,
      },
    ];

    this.currentByte = LSB;

    this.DMAStatCmdReg = 0x00;          // 0x08
    this.DMARequestReg = 0x00;          // 0x09
    this.DMAMultipleMaskReg = 0x00;     // 0x0F

    this.DMAChannel2_PageReg = 0x00;    // 0x81
    this.DMAChannel3_PageReg = 0x00;    // 0x82
    this.DMAChannel1_PageReg = 0x00;    // 0x83

    // Mode register controls
    this.ctl_ChannelSelect      = 0;
    this.ctl_TransferType       = VERIFY_TRANSFER;
    this.ctl_Autoinitialization = false;
    this.ctl_AddressIncDec      = INC;
    this.ctl_ModeSelect         = DEMAND;

    // Command register controls
    this.ctl_Mem2Mem              = 0; // (0=disable, 1=enable)
    this.ctl_Channel0AddressHold  = 0; // (0=disable, 1=enable, X if bit 0=0)
    this.ctl_ControllerEnable     = 0; // (0=enable, 1=disable)
    this.ctl_TimingType           = 0; // (0=normal, 1=compressed, X if bit 0=1)
    this.ctl_Priority             = 0; // (0=fixed, 1=rotating)
    this.ctl_WriteSelection       = 0; // (0=late, 1=extended, X if bit 3=1)
    this.ctl_DREQSenseActiveLevel = 0; // (0=high, 1=low)
    this.ctl_DACKSenseActiveLevel = 0; // (0=low, 1=high)

    // Masks
    this.mask_Channel0 = false;
    this.mask_Channel1 = false;
    this.mask_Channel2 = false;
    this.mask_Channel3 = false;
  }

  /**
   * Write a word to a register one byte at a time keeping track of which byte
   * we're on.
   *
   * @param {number} channel Register channel
   * @param {string} register Name of the register to write
   * @param {number} value Value to write to the register
   */
  writeRegisterWord(channel, register, value) {
    if (this.currentByte === MSB) {
      this.channels[channel][register] = this.channels[channel][register] | (value << 8);
    }
    else this.channels[channel][register] = (this.channels[channel][register] & 0xFF00) | (value & 0xFF);
    this.currentByte = (this.currentByte + 1) % 2;
  }

  /**
   * Read a value from a register one byte at a time keeping track of which byte
   * we're on.
   *
   * @param {number} channel Register channel
   * @param {string} register Name of the register to read
   * @returns {number} Register value
   */
  readRegisterWord(channel, register) {
    let value;
    if (this.currentByte === MSB) value = (this.channels[channel][register] >> 8) & 0xFF;
    else value = this.channels[channel][register] & 0xFF;
    this.currentByte = (this.currentByte + 1) % 2;
    return value;
  }

  write(port, value, size) {
    let channel;
    // 8237 Registers
    switch (port) {
      case 0x00:  // Channel 0 Start Address Register
        this.writeRegisterWord(0,"startAddress", value);
        break;
      case 0x01:  // Channel 0 Count Register
        this.writeRegisterWord(0,"count", value);
        break;
      case 0x02:  // Channel 1 Start Address Register
        this.writeRegisterWord(1, "startAddress", value);
        break;
      case 0x03:  // Channel 1 Count Register
        this.writeRegisterWord(1, "count", value);
        break;
      case 0x04:  // Channel 2 Start Address Register
        this.writeRegisterWord(2, "startAddress", value);
        break;
      case 0x05:  // Channel 2 Count Register
        this.writeRegisterWord(2, "count", value);
        break;
      case 0x06:  // Channel 3 Start Address Register
        this.writeRegisterWord(3, "startAddress", value);
        break;
      case 0x07:  // Channel 3 Count Register
        this.writeRegisterWord(3, "count", value);
        break;
      case 0x08:  // Command Register
        // Can test with a breakpoint at 0xF000:0xE0DC
        this.DMAStatCmdReg        = value & 0xFF;
        this.mem2Mem              = value & 0x1;
        this.channel0AddressHold  = (value >> 1) & 0x1;
        this.controllerEnable     = (value >> 2) & 0x1;
        this.timingType           = (value >> 3) & 0x1;
        this.priority             = (value >> 4) & 0x1;
        this.writeSelection       = (value >> 5) & 0x1;
        this.DREQSenseActiveLevel = (value >> 6) & 0x1;
        this.DACKSenseActiveLevel = (value >> 7) & 0x1;
        break;
      case 0x09:  // Request Register
        throw new FeatureNotImplementedException("DMA port not implemented");
        // this.DMARequestReg = value & 0xFF;
        // break;
      case 0x0A:  // Set channel mask
        channel = (value & 0x3);
        this.channels[channel].masked = ((value >> 2) & 0x1) === 1;
        break;
      case 0x0B:  // Mode Register
        channel = value & 0x3;
        this.channels[channel].ctl_TransferType = (value >> 2) & 0x3;
        this.channels[channel].ctl_AutoInitialization = ((value >> 4) & 0x1) === 1;
        this.channels[channel].ctl_AddressIncDec = (value >> 5) & 0x1;
        this.channels[channel].ctl_ModeSelect = (value >> 6) & 0x3;
        break;
      case 0x0C:  // Flip-flop reset (value doesn't matter)
        this.currentByte = LSB;
        break;
      case 0x0D:  // Master Reset (value doesn't matter)
        // sets flip-flop low,
        this.currentByte = LSB;
        // clears status,
        this.DMAStatCmdReg        = 0;
        this.mem2Mem              = 0;
        this.channel0AddressHold  = 0;
        this.controllerEnable     = 0;
        this.timingType           = 0;
        this.priority             = 0;
        this.writeSelection       = 0;
        this.DREQSenseActiveLevel = 0;
        this.DACKSenseActiveLevel = 0;
        // and sets all Mask bits ON.
        this.channels[0].maskedDRQ = true;
        this.channels[1].maskedDRQ = true;
        this.channels[2].maskedDRQ = true;
        this.channels[3].maskedDRQ = true;
        break;
      case 0x0E:  // Mask Reset (value doesn't matter)
        // sets all mask bits OFF.
        this.channels[0].maskedDRQ = false;
        this.channels[1].maskedDRQ = false;
        this.channels[2].maskedDRQ = false;
        this.channels[3].maskedDRQ = false;
        break;
      case 0x0F:  // Set multiple channel masks
        this.channels[0].maskedDRQ = value & 0x1;
        this.channels[1].maskedDRQ = (value >> 1) & 0x1;
        this.channels[2].maskedDRQ = (value >> 2) & 0x1;
        this.channels[3].maskedDRQ = (value >> 3) & 0x1;
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
      case 0x00:  // Channel 0 Start Address Register
        return this.readRegisterWord(0,"startAddress");
      case 0x01:  // Channel 0 Count Register
        return this.readRegisterWord(0,"count");
      case 0x02:  // Channel 1 Start Address Register
        return this.readRegisterWord(1, "startAddress");
      case 0x03:  // Channel 0 Count Register
        return this.readRegisterWord(1, "count");
      case 0x04:  // Channel 2 Start Address Register
        return this.readRegisterWord(2, "startAddress");
      case 0x05:  // Channel 0 Count Register
        return this.readRegisterWord(2, "count");
      case 0x06:  // Channel 3 Start Address Register
        return this.readRegisterWord(3, "startAddress");
      case 0x07:  // Channel 0 Count Register
        return this.readRegisterWord(3, "count");
      case 0x08:  // Status Register
        throw new FeatureNotImplementedException("DMA port not implemented");
        // return this.DMAStatCmdReg;
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

  timerHandler(value) {
    // We don't actually have to do anything for DMA refreshes.
    this.debug.info(`DMA8237:timerHandler(${value})`);
  }

  boot() {
    this.system.io.devices["PIT8253"].registerChannelLister(1, this.timerHandler.bind(this));
  }

  deviceCycle() {}

}
