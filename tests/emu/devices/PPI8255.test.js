import SystemConfig from "../../../src/emu/config/SystemConfig";
import Operations from "../../../src/emu/cpu/Operations";
import Addressing from "../../../src/emu/cpu/Addressing";
import {b, regCS, regDS, regFlags, regIP, regSP, regSS} from "../../../src/emu/Constants";
import {PortAccessException} from "../../../src/emu/utils/Exceptions";
import CPU8086 from "../../../src/emu/cpu/8086";
import IO from "../../../src/emu/IO";
import PPI8255 from "../../../src/emu/devices/PPI8255";

class MockSystem {
  constructor (config) {
    this.config = config;
    this.cpu = new CPU8086(config, this);
    this.io = new IO(this.config, this,{"PPI8255": new PPI8255(this.config, this)});
  }
}

describe('PPI Mode 0', () => {
  let system, cpu, addr, oper, io;

  beforeEach(() => {
    let config = new SystemConfig({
      memorySize: 2 ** 20,
      ports: {
        memoryMapped: true,
        size: 0xFFFF,
        devices: [
          {"range": [0x0060, 0x0063], "dir": "w", "device": "PPI8255"},
        ],
      },
      jumpers: {
        sw1: 0xFF,
        sw2: 0xAA,
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

  test('set control register', () => {
    io.write(0x0063, 0xFF, b);

    expect(io.devices["PPI8255"].PPIControlWordRegister).toBe(0xFF);
    expect(io.devices["PPI8255"].grpAModeSelection).toBe(2);
    expect(io.devices["PPI8255"].grpBmodeSelection).toBe(1);
    expect(io.devices["PPI8255"].portAInOut).toBe(1);
    expect(io.devices["PPI8255"].portBInOut).toBe(1);
    expect(io.devices["PPI8255"].portCLowerInOut).toBe(1);
    expect(io.devices["PPI8255"].portCUpperInOut).toBe(1);
    expect(io.devices["PPI8255"].modeSetFlag).toBe(1);

  });
  test('read from control register throws error', () => {
    expect(() => {
      io.read(0x0063, b);
    }).toThrowError(PortAccessException);
  });
  test('write to port A', () => {
    // Configure control flags
    io.devices["PPI8255"].grpAModeSelection = 0;
    io.devices["PPI8255"].portAInOut = 0;
    // Set port value to 0
    io.devices["PPI8255"].portA = 0x00;

    io.write(0x0060, 0xFF, b);

    expect(io.devices["PPI8255"].portA).toBe(0xFF);
  });
  test('read from port A', () => {
    // Configure control flags
    io.devices["PPI8255"].grpAModeSelection = 0;
    io.devices["PPI8255"].portAInOut = 1;
    // Set port value to 0xFF
    io.devices["PPI8255"].portA = 0xFF;

    let value = io.read(0x0060, b);

    expect(value).toBe(0xFF);
  });
  test.skip('write to port A when set to input', () => {});
  test.skip('read from port A when set to output', () => {});

  test('write to port B', () => {
    // Configure control flags
    io.devices["PPI8255"].grpBModeSelection = 0;
    io.devices["PPI8255"].portBInOut = 0;
    // Set port value to 0
    io.devices["PPI8255"].portB = 0x00;

    io.write(0x0061, 0xFF, b);

    expect(io.devices["PPI8255"].portB).toBe(0xFF);
  });
  test('read from port B', () => {
    // Configure control flags
    io.devices["PPI8255"].grpBModeSelection = 0;
    io.devices["PPI8255"].portBInOut = 1;
    // Set port value to 0xFF
    io.devices["PPI8255"].portB = 0xFF;

    let value = io.read(0x0061, b);

    expect(value).toBe(0xFF);
  });
  test.skip('write to port B when set to input', () => {});
  test.skip('read from port B when set to output', () => {});

  test('write to port C', () => {
    // Configure control flags
    io.devices["PPI8255"].grpAModeSelection = 0;
    io.devices["PPI8255"].grpBModeSelection = 0;
    io.devices["PPI8255"].portCUpperInOut = 0;
    io.devices["PPI8255"].portCLowerInOut = 0;
    // Set port value to 0
    io.devices["PPI8255"].portC = 0x00;

    io.write(0x0062, 0xFF, b);

    expect(io.devices["PPI8255"].portCUpper).toBe(0xF);
    expect(io.devices["PPI8255"].portCLower).toBe(0xF);
  });
  test('write to port C (upper INPUT, lower OUTPUT)', () => {
    // Configure control flags
    io.devices["PPI8255"].grpAModeSelection = 0;
    io.devices["PPI8255"].grpBModeSelection = 0;
    io.devices["PPI8255"].portCUpperInOut = 1;
    io.devices["PPI8255"].portCLowerInOut = 0;
    // Set port value to 0x00
    io.devices["PPI8255"].portCUpper = 0x0;
    io.devices["PPI8255"].portCLower = 0x0;

    io.write(0x0062, 0xFF, b);

    expect(io.devices["PPI8255"].portCUpper).toBe(0x0);
    expect(io.devices["PPI8255"].portCLower).toBe(0xF);
  });
  test('read from port C', () => {
    // Configure control flags
    io.devices["PPI8255"].grpAModeSelection = 0;
    io.devices["PPI8255"].grpBModeSelection = 0;
    io.devices["PPI8255"].portCUpperInOut = 1;
    io.devices["PPI8255"].portCLowerInOut = 1;
    // Set control lines that feed port C
    io.devices["PPI8255"].CassDataIn = 1;
    io.devices["PPI8255"].TC2Out = 0;
    io.devices["PPI8255"].IOChk = 1;
    io.devices["PPI8255"].pck = 0;

    let value = io.read(0x0062, b);

    expect(value).toBe(0x5A);
  });
  test('read from port C (upper INPUT, lower OUTPUT)', () => {
    // Configure control flags
    io.devices["PPI8255"].grpAModeSelection = 0;
    io.devices["PPI8255"].grpBModeSelection = 0;
    io.devices["PPI8255"].portCUpperInOut = 1;
    io.devices["PPI8255"].portCLowerInOut = 0;
    // Set control lines that feed port C
    io.devices["PPI8255"].CassDataIn = 1;
    io.devices["PPI8255"].TC2Out = 0;
    io.devices["PPI8255"].IOChk = 1;
    io.devices["PPI8255"].pck = 0;

    let value = io.read(0x0062, b);

    expect(value).toBe(0x50);
  });
  test.skip('write to port C when set to input', () => {});
  test.skip('read from port C when set to output', () => {});

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

  // Reset puts all ports to INPUT
});