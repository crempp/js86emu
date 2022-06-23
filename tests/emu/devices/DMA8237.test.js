import CPU8086 from "../../../src/emu/cpu/8086";
import IO from "../../../src/emu/IO";
import SystemConfig from "../../../src/emu/config/SystemConfig";
import {b, regCS, regDS, regFlags, regIP, regSP, regSS} from "../../../src/emu/Constants";
import {PortAccessException} from "../../../src/emu/utils/Exceptions";
import DMA8237 from "../../../src/emu/devices/DMA8237";

class MockSystem {
  constructor (config) {
    this.config = config;
    this.cpu = new CPU8086(config, this);
    this.io = new IO(this.config, this,{"DMA8237": new DMA8237(this.config, this)});
  }
}

describe("DMA Register I/O", () => {
  let system, cpu, io;

  beforeEach(() => {
    let config = new SystemConfig({
      memorySize: 2 ** 20,
      ports: {
        memoryMapped: true,
        size: 0xFFFF,
        devices: [
          {"range": [0x0000, 0x000F], "dir": "rw", "device": "DMA8237"},
          {"range": [0x0081, 0x0083], "dir": "rw", "device": "DMA8237"},
        ]
      },
      debug: false
    });
    system = new MockSystem(config);
    cpu = system.cpu;
    io = system.io;

    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0300;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;
    cpu.reg16[regFlags] = 0x0000;
  });

  test("set DMA Channel 0 Address Reg", () => {
    io.write(0x0000, 0xFF, b);

    expect(io.devices["DMA8237"].channels[0].startAddress).toBe(0xFF);
  });
  test("read DMA Channel 0 Address Reg", () => {
    io.devices["DMA8237"].channels[0].startAddress = 0xAA;
    let result = io.read(0x0000, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 0 Word Count Reg", () => {
    io.write(0x0001, 0xFF, b);

    expect(io.devices["DMA8237"].channels[0].count).toBe(0xFF);
  });
  test("read DMA Channel 0 Word Count Reg", () => {
    io.devices["DMA8237"].channels[0].count = 0xAA;
    let result = io.read(0x0001, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 1 Address Reg", () => {
    io.write(0x0002, 0xFF, b);

    expect(io.devices["DMA8237"].channels[1].startAddress).toBe(0xFF);
  });
  test("read DMA Channel 1 Address Reg", () => {
    io.devices["DMA8237"].channels[1].startAddress = 0xAA;
    let result = io.read(0x0002, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 1 Word Count Reg", () => {
    io.write(0x0003, 0xFF, b);

    expect(io.devices["DMA8237"].channels[1].count).toBe(0xFF);
  });
  test("read DMA Channel 1 Word Count Reg", () => {
    io.devices["DMA8237"].channels[1].count = 0xAA;
    let result = io.read(0x0003, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 2 Address Reg", () => {
    io.write(0x0004, 0xFF, b);

    expect(io.devices["DMA8237"].channels[2].startAddress).toBe(0xFF);
  });
  test("read DMA Channel 2 Address Reg", () => {
    io.devices["DMA8237"].channels[2].startAddress = 0xAA;
    let result = io.read(0x0004, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 2 Word Count Reg", () => {
    io.write(0x0005, 0xFF, b);

    expect(io.devices["DMA8237"].channels[2].count).toBe(0xFF);
  });
  test("read DMA Channel 2 Word Count Reg", () => {
    io.devices["DMA8237"].channels[2].count = 0xAA;
    let result = io.read(0x0005, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 3 Address Reg", () => {
    io.write(0x0006, 0xFF, b);

    expect(io.devices["DMA8237"].channels[3].startAddress).toBe(0xFF);
  });
  test("read DMA Channel 3 Address Reg", () => {
    io.devices["DMA8237"].channels[3].startAddress = 0xAA;
    let result = io.read(0x0006, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Channel 3 Word Count Reg", () => {
    io.write(0x0007, 0xFF, b);

    expect(io.devices["DMA8237"].channels[3].count).toBe(0xFF);
  });
  test("read DMA Channel 3 Address Reg", () => {
    io.devices["DMA8237"].channels[3].count = 0xAA;
    let result = io.read(0x0007, b);

    expect(result).toBe(0xAA);
  });
  test("set DMA Stat Command Reg", () => {
    io.write(0x0008, 0xFF, b);

    expect(io.devices["DMA8237"].DMAStatCmdReg).toBe(0xFF);
  });
  test("DMA Request Reg is read only", () => {
    expect(() => {
      io.read(0x0009, b);
    }).toThrowError(PortAccessException);
  });
  test("set channel 3 DMAMaskReg", () => {
    io.write(0x000A, 0xFF, b);

    expect(io.devices["DMA8237"].channels[3].masked).toBe(true);
  });
  test("DMAMaskReg is read only", () => {
    expect(() => {
      io.read(0x000A, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAModeReg", () => {
    io.write(0x000B, 0xFF, b);

    expect(io.devices["DMA8237"].channels[3].ctl_TransferType).toBe(3);
    expect(io.devices["DMA8237"].channels[3].ctl_AutoInitialization).toBe(true);
    expect(io.devices["DMA8237"].channels[3].ctl_AddressIncDec).toBe(1);
    expect(io.devices["DMA8237"].channels[3].ctl_ModeSelect).toBe(3);
  });
  test("DMAModeReg is read only", () => {
    expect(() => {
      io.read(0x000B, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAClearFlipFlopReg", () => {
    io.write(0x000C, 0xFF, b);

    expect(io.devices["DMA8237"].currentByte).toBe(0);
  });
  test("DMAClearFlipFlopReg is read only", () => {
    expect(() => {
      io.read(0x000C, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAMasterClearTempReg", () => {
    io.write(0x000D, 0xFF, b);

    expect(io.devices["DMA8237"].currentByte).toBe(0);
    expect(io.devices["DMA8237"].DMAStatCmdReg).toBe(0);
    expect(io.devices["DMA8237"].mem2Mem).toBe(0);
    expect(io.devices["DMA8237"].channel0AddressHold).toBe(0);
    expect(io.devices["DMA8237"].controllerEnable).toBe(0);
    expect(io.devices["DMA8237"].timingType).toBe(0);
    expect(io.devices["DMA8237"].priority).toBe(0);
    expect(io.devices["DMA8237"].writeSelection).toBe(0);
    expect(io.devices["DMA8237"].DREQSenseActiveLevel).toBe(0);
    expect(io.devices["DMA8237"].DACKSenseActiveLevel).toBe(0);
    expect(io.devices["DMA8237"].channels[0].maskedDRQ).toBe(true);
    expect(io.devices["DMA8237"].channels[1].maskedDRQ).toBe(true);
    expect(io.devices["DMA8237"].channels[2].maskedDRQ).toBe(true);
    expect(io.devices["DMA8237"].channels[3].maskedDRQ).toBe(true);
  });
  test("DMAMasterClearTempReg is read only", () => {
    expect(() => {
      io.read(0x000D, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAClearMaskReg", () => {
    io.write(0x000E, 0xFF, b);

    expect(io.devices["DMA8237"].channels[0].maskedDRQ).toBe(false);
    expect(io.devices["DMA8237"].channels[1].maskedDRQ).toBe(false);
    expect(io.devices["DMA8237"].channels[2].maskedDRQ).toBe(false);
    expect(io.devices["DMA8237"].channels[3].maskedDRQ).toBe(false);
  });
  test("DMAClearMaskReg is read only", () => {
    expect(() => {
      io.read(0x000E, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAMultipleMaskReg", () => {
    io.write(0x000F, 0xFF, b);

    expect(io.devices["DMA8237"].channels[0].maskedDRQ).toBe(1);
    expect(io.devices["DMA8237"].channels[1].maskedDRQ).toBe(1);
    expect(io.devices["DMA8237"].channels[2].maskedDRQ).toBe(1);
    expect(io.devices["DMA8237"].channels[3].maskedDRQ).toBe(1);
  });
  test("DMAMultipleMaskReg is read only", () => {
    expect(() => {
      io.read(0x000F, b);
    }).toThrowError(PortAccessException);
  });


  test("set DMAChannel2_PageReg", () => {
    io.write(0x0081, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel2_PageReg).toBe(0x0F);
  });
  test("DMAChannel2_PageReg is read only", () => {
    expect(() => {
      io.read(0x0081, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAChannel3_PageReg", () => {
    io.write(0x0082, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel3_PageReg).toBe(0x0F);
  });
  test("DMAChannel3_PageReg is read only", () => {
    expect(() => {
      io.read(0x0082, b);
    }).toThrowError(PortAccessException);
  });
  test("set DMAChannel1_PageReg", () => {
    io.write(0x0083, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel1_PageReg).toBe(0x0F);
  });
  test("DMAChannel1_PageReg is read only", () => {
    expect(() => {
      io.read(0x0083, b);
    }).toThrowError(PortAccessException);
  });
});