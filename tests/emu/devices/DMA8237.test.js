import CPU8086 from "../../../src/emu/cpu/8086";
import IO from "../../../src/emu/IO";
import SystemConfig from "../../../src/emu/config/SystemConfig";
import Operations from "../../../src/emu/cpu/Operations";
import Addressing from "../../../src/emu/cpu/Addressing";
import {b, regAL, regCS, regDS, regFlags, regIP, regSP, regSS} from "../../../src/emu/Constants";
import {PortAccessException} from "../../../src/emu/utils/Exceptions";
import DMA8237 from "../../../src/emu/devices/DMA8237";

class MockSystem {
  constructor (config) {
    this.config = config;
    this.cpu = new CPU8086(config, this);
    this.io = new IO(this.config, this,{"DMA8237": new DMA8237(this)});
  }
}

describe('DMA Register I/O', () => {
  let system, cpu, addr, oper, io;

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
    system = new MockSystem(config)
    cpu = system.cpu;
    io = system.io;

    oper = new Operations(cpu);
    addr = new Addressing(cpu);
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0300;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;
    cpu.reg16[regFlags] = 0x0000;
  });

  test('set DMAChannel0_AddressReg', () => {
    io.write(0x0000, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel0_AddressReg).toBe(0xFF);
  });
  test('read DMAChannel0_AddressReg', () => {
    io.devices["DMA8237"].DMAChannel0_AddressReg = 0xAA
    let result = io.read(0x0000, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel0_WordCntReg', () => {
    io.write(0x0001, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel0_WordCntReg).toBe(0xFF);
  });
  test('read DMAChannel0_WordCntReg', () => {
    io.devices["DMA8237"].DMAChannel0_WordCntReg = 0xAA
    let result = io.read(0x0001, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel1_AddressReg', () => {
    io.write(0x0002, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel1_AddressReg).toBe(0xFF);
  });
  test('read DMAChannel1_AddressReg', () => {
    io.devices["DMA8237"].DMAChannel1_AddressReg = 0xAA
    let result = io.read(0x0002, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel1_WordCntReg', () => {
    io.write(0x0003, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel1_WordCntReg).toBe(0xFF);
  });
  test('read DMAChannel1_WordCntReg', () => {
    io.devices["DMA8237"].DMAChannel1_WordCntReg = 0xAA
    let result = io.read(0x0003, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel2_AddressReg', () => {
    io.write(0x0004, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel2_AddressReg).toBe(0xFF);
  });
  test('read DMAChannel2_AddressReg', () => {
    io.devices["DMA8237"].DMAChannel2_AddressReg = 0xAA
    let result = io.read(0x0004, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel2_WordCntReg', () => {
    io.write(0x0005, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel2_WordCntReg).toBe(0xFF);
  });
  test('read DMAChannel2_WordCntReg', () => {
    io.devices["DMA8237"].DMAChannel2_WordCntReg = 0xAA
    let result = io.read(0x0005, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel2_AddressReg', () => {
    io.write(0x0006, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel2_AddressReg).toBe(0xFF);
  });
  test('read DMAChannel2_AddressReg', () => {
    io.devices["DMA8237"].DMAChannel2_AddressReg = 0xAA
    let result = io.read(0x0006, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAChannel3_WordCntReg', () => {
    io.write(0x0007, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel3_WordCntReg).toBe(0xFF);
  });
  test('read DMAChannel2_AddressReg', () => {
    io.devices["DMA8237"].DMAChannel3_WordCntReg = 0xAA
    let result = io.read(0x0007, b);

    expect(result).toBe(0xAA);
  });
  test('set DMAStatCmdReg', () => {
    io.write(0x0008, 0xFF, b);

    expect(io.devices["DMA8237"].DMAStatCmdReg).toBe(0xFF);
  });
  test('read DMAStatCmdReg', () => {
    io.devices["DMA8237"].DMAStatCmdReg = 0xAA
    let result = io.read(0x0008, b);

    expect(result).toBe(0xAA);
  });
  test('set DMARequestReg', () => {
    io.write(0x0009, 0xFF, b);

    expect(io.devices["DMA8237"].DMARequestReg).toBe(0xFF);
  });
  test('DMARequestReg is read only', () => {
    expect(() => {
      io.read(0x0009, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAMaskReg', () => {
    io.write(0x000A, 0xFF, b);

    expect(io.devices["DMA8237"].DMAMaskReg).toBe(0xFF);
  });
  test('DMAMaskReg is read only', () => {
    expect(() => {
      io.read(0x000A, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAModeReg', () => {
    io.write(0x000B, 0xFF, b);

    expect(io.devices["DMA8237"].DMAModeReg).toBe(0xFF);
  });
  test('DMAModeReg is read only', () => {
    expect(() => {
      io.read(0x000B, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAClearFlipFlopReg', () => {
    io.write(0x000C, 0xFF, b);

    expect(io.devices["DMA8237"].DMAClearFlipFlopReg).toBe(0xFF);
  });
  test('DMAClearFlipFlopReg is read only', () => {
    expect(() => {
      io.read(0x000C, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAMasterClearTempReg', () => {
    io.write(0x000D, 0xFF, b);

    expect(io.devices["DMA8237"].DMAMasterClearTempReg).toBe(0xFF);
  });
  test('DMAMasterClearTempReg is read only', () => {
    expect(() => {
      io.read(0x000D, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAClearMaskReg', () => {
    io.write(0x000E, 0xFF, b);

    expect(io.devices["DMA8237"].DMAClearMaskReg).toBe(0xFF);
  });
  test('DMAClearMaskReg is read only', () => {
    expect(() => {
      io.read(0x000E, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAMultipleMaskReg', () => {
    io.write(0x000F, 0xFF, b);

    expect(io.devices["DMA8237"].DMAMultipleMaskReg).toBe(0xFF);
  });
  test('DMAMultipleMaskReg is read only', () => {
    expect(() => {
      io.read(0x000F, b);
    }).toThrowError(PortAccessException);
  });


  test('set DMAChannel2_PageReg', () => {
    io.write(0x0081, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel2_PageReg).toBe(0x0F);
  });
  test('DMAChannel2_PageReg is read only', () => {
    expect(() => {
      io.read(0x0081, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAChannel3_PageReg', () => {
    io.write(0x0082, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel3_PageReg).toBe(0x0F);
  });
  test('DMAChannel3_PageReg is read only', () => {
    expect(() => {
      io.read(0x0082, b);
    }).toThrowError(PortAccessException);
  });
  test('set DMAChannel1_PageReg', () => {
    io.write(0x0083, 0xFF, b);

    expect(io.devices["DMA8237"].DMAChannel1_PageReg).toBe(0x0F);
  });
  test('DMAChannel1_PageReg is read only', () => {
    expect(() => {
      io.read(0x0083, b);
    }).toThrowError(PortAccessException);
  });


  // test('IN instruction throws', () => {
  //   cpu.mem8[0x00FF] = 0xE4;
  //   cpu.mem8[0x0100] = 0xA0;
  //   cpu.instIPInc = 1;
  //   cpu.decode();
  //
  //   expect(() => {
  //     oper.in(addr.AL.bind(addr), addr.Ib.bind(addr));
  //   }).toThrowError(PortAccessException);
  // });
  // test('OUT instruction set NMI', () => {
  //   cpu.reg8[regAL] = 0x80;
  //   cpu.mem8[0x00FF] = 0xE6;
  //   cpu.mem8[0x0100] = 0xA0;
  //   cpu.instIPInc = 1;
  //   cpu.decode();
  //   oper.out(addr.Ib.bind(addr), addr.AL.bind(addr));
  //
  //   expect(io.devices["NMIMaskRegister"].NMIMaskRegister).toBe(0x80);
  //   expect(io.devices["NMIMaskRegister"].isMasked()).toBe(true);
  // });
  // test('OUT instruction un-set NMI', () => {
  //   cpu.reg8[regAL] = 0x00;
  //   cpu.mem8[0x00FF] = 0xE6;
  //   cpu.mem8[0x0100] = 0x80;
  //   cpu.instIPInc = 1;
  //   cpu.decode();
  //   oper.out(addr.Ib.bind(addr), addr.AL.bind(addr));
  //
  //   expect(io.devices["NMIMaskRegister"].NMIMaskRegister).toBe(0x00);
  //   expect(io.devices["NMIMaskRegister"].isMasked()).toBe(false);
  // });
})