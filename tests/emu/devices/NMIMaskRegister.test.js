import CPU8086 from "../../../src/emu/cpu/8086";
import IO from "../../../src/emu/IO";
import SystemConfig from "../../../src/emu/config/SystemConfig";
import Operations from "../../../src/emu/cpu/Operations";
import Addressing from "../../../src/emu/cpu/Addressing";
import {b, regAL, regCS, regDS, regFlags, regIP, regSP, regSS} from "../../../src/emu/Constants";
import NMIMaskRegister from "../../../src/emu/devices/NMIMaskRegister";
import {PortAccessException} from "../../../src/emu/utils/Exceptions";

class MockSystem {
  constructor (config) {
    this.config = config;
    this.cpu = new CPU8086(config, this);
    this.io = new IO(this.config, this,{"NMIMaskRegister": new NMIMaskRegister(this)});
  }
}

describe('NMI mask register', () => {
  let system, cpu, addr, oper, io;

  beforeEach(() => {
    let config = new SystemConfig({
      memorySize: 2 ** 20,
      ports: {
        memoryMapped: true,
        size: 0xFFFF,
        devices: [
          {"range": [0x00A0], "dir": "w", "device": "NMIMaskRegister"},
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

  test('set mask register', () => {
    io.write(0x00A0, 0x80, b);

    expect(io.devices["NMIMaskRegister"].NMIMaskRegister).toBe(0x80);
    expect(io.devices["NMIMaskRegister"].isMasked()).toBe(true);
  });
  test('un-set mask register', () => {
    io.write(0x00A0, 0x00, b);

    expect(io.devices["NMIMaskRegister"].NMIMaskRegister).toBe(0x00);
    expect(io.devices["NMIMaskRegister"].isMasked()).toBe(false);
  });
  test('mask register is read only', () => {
    expect(() => {
      io.read(0x00A0, b);
    }).toThrowError(PortAccessException);
  });
  test('IN instruction throws', () => {
    cpu.mem8[0x00FF] = 0xE4;
    cpu.mem8[0x0100] = 0xA0;
    cpu.instIPInc = 1;
    cpu.decode();

    expect(() => {
      oper.in(addr.AL.bind(addr), addr.Ib.bind(addr));
    }).toThrowError(PortAccessException);
  });
  test('OUT instruction set NMI', () => {
    cpu.reg8[regAL] = 0x80;
    cpu.mem8[0x00FF] = 0xE6;
    cpu.mem8[0x0100] = 0xA0;
    cpu.instIPInc = 1;
    cpu.decode();
    oper.out(addr.Ib.bind(addr), addr.AL.bind(addr));

    expect(io.devices["NMIMaskRegister"].NMIMaskRegister).toBe(0x80);
    expect(io.devices["NMIMaskRegister"].isMasked()).toBe(true);
  });
  test('OUT instruction un-set NMI', () => {
    cpu.reg8[regAL] = 0x00;
    cpu.mem8[0x00FF] = 0xE6;
    cpu.mem8[0x0100] = 0x80;
    cpu.instIPInc = 1;
    cpu.decode();
    oper.out(addr.Ib.bind(addr), addr.AL.bind(addr));

    expect(io.devices["NMIMaskRegister"].NMIMaskRegister).toBe(0x00);
    expect(io.devices["NMIMaskRegister"].isMasked()).toBe(false);
  });
})