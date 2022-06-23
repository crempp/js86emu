import CPU8086 from '../../../src/emu/cpu/8086';
import Addressing from '../../../src/emu/cpu/Addressing';
import SystemConfig from '../../../src/emu/config/SystemConfig';
import Operations from "../../../src/emu/cpu/Operations";
import IO from "../../../src/emu/IO";
import {FeatureNotImplementedException, TemporaryInterruptException} from "../../../src/emu/utils/Exceptions";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
  STATE_HALT, STATE_REP_Z, STATE_REP, STATE_REP_NZ, STATE_SEG_CS, STATE_SEG_DS, STATE_SEG_ES, STATE_SEG_SS, STATE_WAIT,
} from '../../../src/emu/Constants';
import TestDevice from "../../../src/emu/devices/TestDevice";
import Debug from "../../../src/emu/utils/Debug";

let IVT = [
  /* INT   |   Offset   | Segment  */
  /* 0x00 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x01 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x02 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x03 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x04 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x05 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x06 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x07 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x08 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x09 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x0A */ 0x12, 0x34, 0x56, 0x78,
  /* 0x0B */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x0C */ 0x12, 0x34, 0x56, 0x78,
  /* 0x0D */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x0E */ 0x12, 0x34, 0x56, 0x78,
  /* 0x0F */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x10 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x11 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x12 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x13 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x14 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x15 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x16 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x17 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x18 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x19 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x1A */ 0x12, 0x34, 0x56, 0x78,
  /* 0x1B */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x1C */ 0x12, 0x34, 0x56, 0x78,
  /* 0x1D */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x1E */ 0x12, 0x34, 0x56, 0x78,
  /* 0x1F */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x20 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x21 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x22 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x23 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x24 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x25 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x26 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x27 */ 0x9A, 0xBC, 0xDE, 0xF0,
  /* 0x28 */ 0x12, 0x34, 0x56, 0x78,
  /* 0x29 */ 0x9A, 0xBC, 0xDE, 0xF0,
  // ...
];

function loadIVT (cpu) {
  for (let i = 0; i < IVT.length; i++) {
    cpu.mem8[i] = IVT[i];
  }
}

function setMemory(cpu, value) {
  for (let i = 0; i < cpu.mem8.length; i++) {
    cpu.mem8[i] = value;
  }
}

class MockSystem {
  constructor (config) {
    this.config = config;
    this.debug = new Debug(this);
    this.cpu = new CPU8086(config, this);
    this.io = new IO(this.config, this,{"TestDevice": new TestDevice(config, this)});
  }
}

describe('Operation methods', () => {
  let system, cpu, addr, oper, io;

  beforeEach(() => {
    let config = new SystemConfig({
      memorySize: 2 ** 20,
      ports: {
        memoryMapped: true,
        size: 0xFFFF,
        devices: [
          {"range": [0x0000, 0xFFFF], "dir": "rw", "device": "TestDevice"}
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

  describe('aaa', () => {
    test('least significant >9', () => {
      cpu.reg16[regAX] = 0x006D;
      cpu.mem8[0x00FF] = 0x37;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aaa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0103);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('least significant <9', () => {
      cpu.reg16[regAX] = 0x0068;
      cpu.mem8[0x00FF] = 0x37;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aaa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0008);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('least significant =9', () => {
      cpu.reg16[regAX] = 0x0069;
      cpu.mem8[0x00FF] = 0x37;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aaa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0009);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('least significant <9 and AF set', () => {
      cpu.reg16[regFlags] = 0x0010; // AF Set
      cpu.reg16[regAX] = 0x0068;    // AL is < 9
      cpu.mem8[0x00FF] = 0x37;      // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aaa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x010E);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('least significant <9 clears flags', () => {
      cpu.reg16[regAX] = 0x0068;
      cpu.mem8[0x00FF] = 0x37;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aaa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0008);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
  });

  describe('aad', () => {
    test('AX=0x0207', () => {
      cpu.reg16[regAX] = 0x0207;
      cpu.mem8[0x00FF] = 0xD5;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aad(null, null);

      expect(cpu.reg16[regAX]).toBe(0x001B);
    });
  });

  describe('aam', () => {
    test('AX=0x001B', () => {
      cpu.reg16[regAX] = 0x001B;
      cpu.mem8[0x00FF] = 0xD4;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aam(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0207);
    });
  });

  describe('aas', () => {
    test('positive result, least significant >9', () => {
      cpu.reg16[regAX] = 0x006D;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0xFF07);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('positive result, least significant <9', () => {
      cpu.reg16[regAX] = 0x0068;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0008);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('positive result, least significant =9', () => {
      cpu.reg16[regAX] = 0x0069;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0009);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('positive result, least significant <9 and AF set', () => {
      cpu.reg16[regFlags] = 0x0010; // AF Set
      cpu.reg16[regAX] = 0x0068;    // AL is < 9
      cpu.mem8[0x00FF] = 0x3F;      // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0xFF02);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('negative result, least significant >9', () => {
      cpu.reg16[regAX] = 0x00FA;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0xFF04);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('negative result, least significant <9', () => {
      cpu.reg16[regAX] = 0x00F8;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0008);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('negative result, least significant =9', () => {
      cpu.reg16[regAX] = 0x00F9;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0009);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('negative result, least significant <9 and AF set', () => {
      cpu.reg16[regFlags] = 0x00F8; // AF Set
      cpu.reg16[regAX] = 0x0068;    // AL is < 9
      cpu.mem8[0x00FF] = 0x3F;      // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0xFF02);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('least significant <9 clears flags', () => {
      cpu.reg16[regAX] = 0x0068;
      cpu.mem8[0x00FF] = 0x3F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.aas(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0008);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
  });

  describe('adc', () => {
    test('+dst, +src no carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000010;
      cpu.reg16[regAX] = 0x1235;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x15;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.adc(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x2469);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('+dst, +src with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000011;
      cpu.reg16[regAX] = 0x1235;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x15;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.adc(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x246A);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('-dst, +src with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000011;
      cpu.reg16[regAX] = 0xFFFF;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x15;
      cpu.mem8[0x0100] = 0x35;
      cpu.mem8[0x0101] = 0x12;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.adc(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1235);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('+dst, -src with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000011;
      cpu.reg16[regAX] = 0x1235;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x15;
      cpu.mem8[0x0100] = 0xFF;
      cpu.mem8[0x0101] = 0xFF;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.adc(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1235);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('-dst, -src with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000011;
      cpu.reg16[regAX] = 0xFFFF;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x15;
      cpu.mem8[0x0100] = 0xFF;
      cpu.mem8[0x0101] = 0xFF;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.adc(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0xFFFF);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('Overflow with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000011;
      cpu.reg16[regAX] = 0x7FFF;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x15;
      cpu.mem8[0x0100] = 0x00;
      cpu.mem8[0x0101] = 0x80;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.adc(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      // This OF calculation is confusing but accurate
      // 0x8000    1000 0000 0000 0000 -32768
      // 0x7FFF  + 0111 1111 1111 1111  32767
      // -----------------------------
      //           1111 1111 1111 1111     -1
      // 		     + 0000 0000 0000 0001     +1
      // -----------------------------
      //         1 0000 0000 0000 0000      0
      // Note that the result fits in the operand
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('add', () => {
    beforeEach(() => {});

    test('+dst, +src', () => {
      cpu.reg16[regAX] = 0x1235;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x05;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.add(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x2469);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('-dst, +src', () => {
      cpu.reg16[regAX] = 0xFFFF;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x05;
      cpu.mem8[0x0100] = 0x35;
      cpu.mem8[0x0101] = 0x12;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.add(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('+dst, -src', () => {
      cpu.reg16[regAX] = 0x1235;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x05;
      cpu.mem8[0x0100] = 0xFF;
      cpu.mem8[0x0101] = 0xFF;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.add(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('-dst, -src', () => {
      cpu.reg16[regAX] = 0xFFFF;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x05;
      cpu.mem8[0x0100] = 0xFF;
      cpu.mem8[0x0101] = 0xFF;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.add(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0xFFFE);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('Overflow', () => {
      cpu.reg16[regAX] = 0x8000;
      // ADD AX,iv
      cpu.mem8[0x00FF] = 0x05;
      cpu.mem8[0x0100] = 0x00;
      cpu.mem8[0x0101] = 0x80;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.add(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
    test('[regression] add dx,ax', () => {
      cpu.reg16[regAX] = 0x0090;
      cpu.reg16[regDX] = 0x0059;
      cpu.mem8[0x00FF] = 0x01; // inst
      cpu.mem8[0x0100] = 0xC2; // addr
      cpu.instIPInc = 2;
      cpu.decode();
      oper.add(addr.Ev.bind(addr), addr.Gv.bind(addr));

      expect(cpu.reg16[regDX]).toBe(0x00E9);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('and', () => {
    test('AND AX Iv', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x000FF] = 0x25; // inst (byte)
      cpu.mem8[0x00100] = 0x21; // oper low
      cpu.mem8[0x00101] = 0x34; // oper high
      cpu.instIPInc = 1;

      cpu.decode();
      oper.and(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1020);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('call', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('CALL Ap (far)', () => {
      cpu.mem8[0x000FF] = 0x9A; // inst (byte)
      cpu.mem8[0x00100] = 0x78; // v1 high
      cpu.mem8[0x00101] = 0x56; // v1 low
      cpu.mem8[0x00102] = 0xBC; // v2 high
      cpu.mem8[0x00103] = 0x9A; // v2 low
      cpu.decode();
      cpu.instIPInc = 1;
      oper.call(addr.Ap.bind(addr), null);

      // CS on stack
      expect(cpu.mem8[0x401E]).toBe(0x00);
      expect(cpu.mem8[0x401F]).toBe(0x00);
      // IP on stack
      expect(cpu.mem8[0x401C]).toBe(0x04);
      expect(cpu.mem8[0x401D]).toBe(0x01);
      // CS and IP updated to called location
      expect(cpu.reg16[regCS]).toBe(0x9ABC);
      expect(cpu.reg16[regIP]).toBe(0x5678);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(4);
    });
    test('CALL Jv (near) positive offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xE8; // inst (byte)
      cpu.mem8[0x00100] = 0x34; // segment byte high
      cpu.mem8[0x00101] = 0x12; // segment byte low
      cpu.decode();
      cpu.instIPInc = 1;
      oper.call(addr.Jv.bind(addr), null);

      // IP on stack
      expect(cpu.mem8[0x401E]).toBe(0x02);
      expect(cpu.mem8[0x401F]).toBe(0x01);
      // CS and IP updated to called location
      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x1234);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('CALL Jv (near) negative offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xE8; // inst (byte)
      cpu.mem8[0x00100] = 0xF6; // segment byte high
      cpu.mem8[0x00101] = 0xFF; // segment byte low
      cpu.decode();
      cpu.instIPInc = 1;
      oper.call(addr.Jv.bind(addr), null);

      // IP on stack
      expect(cpu.mem8[0x401E]).toBe(0x02);
      expect(cpu.mem8[0x401F]).toBe(0x01);
      // CS and IP updated to called location
      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0xFF - 0x0A);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('CALL Ev (near)', () => {
      cpu.mem8[0x000FF] = 0xFF; // inst (byte)
      cpu.mem8[0x00100] = 0b11010000; // addr mode
      cpu.reg16[regAX] = 0x1234;
      cpu.decode();
      oper.call(addr.Ev.bind(addr), null);

      // IP on stack
      expect(cpu.mem8[0x401E]).toBe(0xFF);
      expect(cpu.mem8[0x401F]).toBe(0x00);
      // CS and IP updated to called location
      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x1234);
      expect(cpu.instIPInc).toBe(0);
    });
    test('CALL Ep (far)', () => {
      cpu.mem8[0x000FF] = 0xFF; // inst (byte)
      cpu.mem8[0x00100] = 0b00011100; // addr mode
      cpu.reg16[regSI] = 0x1234;
      cpu.mem8[0x04234] = 0x78; // v1 high
      cpu.mem8[0x04235] = 0x56; // v1 low
      cpu.mem8[0x04236] = 0xBC; // v2 high
      cpu.mem8[0x04237] = 0x9A; // v2 low
      cpu.decode();
      oper.call(addr.Ep.bind(addr), null);

      // CS on stack
      expect(cpu.mem8[0x401E]).toBe(0x00);
      expect(cpu.mem8[0x401F]).toBe(0x00);
      // IP on stack
      expect(cpu.mem8[0x401C]).toBe(0xFF);
      expect(cpu.mem8[0x401D]).toBe(0x00);
      // CS and IP updated to called location
      expect(cpu.reg16[regIP]).toBe(0x5678);
      expect(cpu.reg16[regCS]).toBe(0x9ABC);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('cbw', () => {
    test('has sign bit', () => {
      cpu.reg16[regAL] = 0xB7;
      cpu.mem8[0x00FF] = 0x98;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.cbw(null, null);

      expect(cpu.reg8[regAL]).toBe(0xB7);
      expect(cpu.reg8[regAH]).toBe(0xFF);
      expect(cpu.reg16[regFlags]).toBe(0);
    });
    test('has no sign bit', () => {
      cpu.reg16[regAX] = 0x37;
      cpu.mem8[0x00FF] = 0x98;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.cbw(null, null);

      expect(cpu.reg8[regAL]).toBe(0x37);
      expect(cpu.reg8[regAH]).toBe(0x00);
      expect(cpu.reg16[regFlags]).toBe(0);
    });
  });

  describe('clc', () => {
    test('CLC with CF set', () => {
      cpu.reg16[regFlags] = 0b1111111111111111;
      cpu.mem8[0x000FF] = 0xF8; // inst (byte)
      cpu.decode();

      oper.clc(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111111111111110);
    });
  });

  describe('cld', () => {
    test('CLD with DF set', () => {
      cpu.reg16[regFlags] = 0b1111111111111111;
      cpu.mem8[0x000FF] = 0xFC; // inst (byte)
      cpu.decode();

      oper.cld(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111101111111111);
    });
  });

  describe('cli', () => {
    test('CLI with IF set', () => {
      cpu.reg16[regFlags] = 0b1111111111111111;
      cpu.mem8[0x000FF] = 0xFA; // inst (byte)
      cpu.decode();

      oper.cli(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111110111111111);
    });
  });

  describe('cmc', () => {
    test('CMC with CF set', () => {
      cpu.reg16[regFlags] = 0b1111111111111111;
      cpu.mem8[0x000FF] = 0xF5; // inst (byte)
      cpu.decode();

      oper.cmc(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111111111111110);
    });
    test('CMC with CF clear', () => {
      cpu.reg16[regFlags] = 0b1111111111111110;
      cpu.mem8[0x000FF] = 0xF5; // inst (byte)
      cpu.decode();

      oper.cmc(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111111111111111);
    });
  });

  describe('cmp', () => {
    beforeEach(() => {
      // CMP AX,iv
      cpu.mem8[0x00FF] = 0x3D;
      cpu.instIPInc = 1;
    });
    test('dst > src', () => {
      //  0x1235 > 0x1234
      cpu.reg16[regAX] = 0x1235;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.cmp(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('dst < src', () => {
      // 0x1234 > 0x1235
      // 0x1234 - 0x1235 = 0xFFFF

      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x35;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.cmp(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('dst = src', () => {
      // 0x1234 = 0x1234
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.cmp(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('dst > src with overflow', () => {
      // 0x8000 > 0x0001 (0x7FFF)
      cpu.reg16[regAX] = 0x8000;
      cpu.mem8[0x0100] = 0x01;
      cpu.mem8[0x0101] = 0x00;
      cpu.decode();
      oper.cmp(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
    test('[regression] cmp ax, 9', () => {
      cpu.reg16[regAX] = 0x0001;
      cpu.mem8[0x00FF] = 0x83;
      cpu.mem8[0x0100] = 0xF8; // 0b11 111 000
      cpu.mem8[0x0101] = 0x09;
      cpu.instIPInc = 2;
      cpu.decode();
      oper.cmp(addr.Ev.bind(addr), addr.Ib.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('cmpsb', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xAF;
      // ES:DI = 0x1234 * 0x10 + 0x3456 = 0x15796
      cpu.reg16[regES] = 0x1234;
      cpu.reg16[regDI] = 0x3456;
      cpu.mem8[0x15796] = 0x89;
      cpu.mem8[0x15797] = 0x67;
      // DS:SI = 0x2345 * 0x10 + 0x4567 = 0x279B7
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x4567;
      cpu.mem8[0x279B7] = 0x78;
      cpu.mem8[0x279B8] = 0x56;
      cpu.instIPInc = 1;
    });
    test('cmpsb increment', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.cmpsb();

      // 0x78 - 0x89 = 0xEF (-17)
      expect(cpu.reg16[regDI]).toBe(0x3457);
      expect(cpu.reg16[regSI]).toBe(0x4568);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('cmpsb decrement', () => {
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.decode();
      oper.cmpsb();

      // 0x78 - 0x89 = 0xEF (-17)
      expect(cpu.reg16[regDI]).toBe(0x3455);
      expect(cpu.reg16[regSI]).toBe(0x4566);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    })
  });

  describe('cmpsw', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xAF;
      // ES:DI = 0x1234 * 0x10 + 0x3456 = 0x15796
      cpu.reg16[regES] = 0x1234;
      cpu.reg16[regDI] = 0x3456;
      cpu.mem8[0x15796] = 0x89;
      cpu.mem8[0x15797] = 0x67;
      // DS:SI = 0x2345 * 0x10 + 0x4567 = 0x279B7
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x4567;
      cpu.mem8[0x279B7] = 0x78;
      cpu.mem8[0x279B8] = 0x56;
      cpu.instIPInc = 1;
    });
    test('cmpsw increment', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.cmpsw();

      // 0x5678 - 0x6789 = 0xEEEF (-4369)
      // 0x78 - 0x89 = 0xEF (-17)
      expect(cpu.reg16[regDI]).toBe(0x3458);
      expect(cpu.reg16[regSI]).toBe(0x4569);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('cmpsw decrement', () => {
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.decode();
      oper.cmpsw();

      // 0x5678 - 0x6789 = 0xEEEF (-4369)
      expect(cpu.reg16[regDI]).toBe(0x3454);
      expect(cpu.reg16[regSI]).toBe(0x4565);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('cs', () => {
    test('CS sets addrSeg', () => {
      oper.cs();

      expect(cpu.addrSeg).toBe(regCS);
      expect(cpu.prefixSegmentState).toBe(STATE_SEG_CS);
    })
  });

  describe('cwd', () => {
    test('has sign bit', () => {
      cpu.reg16[regAX] = 0xB723;
      cpu.mem8[0x00FF] = 0x99;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.cwd(null, null);

      expect(cpu.reg16[regAX]).toBe(0xB723);
      expect(cpu.reg16[regDX]).toBe(0xFFFF);
      expect(cpu.reg16[regFlags]).toBe(0);
    });
    test('has no sign bit', () => {
      cpu.reg16[regAX] = 0x3723;
      cpu.mem8[0x00FF] = 0x99;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.cwd(null, null);

      expect(cpu.reg16[regAX]).toBe(0x3723);
      expect(cpu.reg16[regDX]).toBe(0x0000);
      expect(cpu.reg16[regFlags]).toBe(0);
    });
  });

  describe('daa', () => {
    test('msb >9, lsb >9', () => {
      cpu.reg16[regAX] = 0x00AD;
      cpu.mem8[0x00FF] = 0x27;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.daa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0013);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('msb <=9, lsb >9', () => {
      cpu.reg16[regAX] = 0x004B;
      cpu.mem8[0x00FF] = 0x27;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.daa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0051);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('msb >9, lsb <=9', () => {
      cpu.reg16[regAX] = 0x00B4;
      cpu.mem8[0x00FF] = 0x27;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.daa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0014);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('msb <=9, lsb <=9', () => {
      cpu.reg16[regAX] = 0x0044;
      cpu.mem8[0x00FF] = 0x27;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.daa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0044);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('msb <=9, lsb <=9, AF set', () => {
      cpu.reg16[regFlags] = 0x0010; // AF Set
      cpu.reg16[regAX] = 0x0044;
      cpu.mem8[0x00FF] = 0x27;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.daa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x004A);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('msb <=9, lsb <=9, CF set', () => {
      cpu.reg16[regFlags] = 0x0001; // CF Set
      cpu.reg16[regAX] = 0x0044;
      cpu.mem8[0x00FF] = 0x27;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.daa(null, null);

      expect(cpu.reg16[regAX]).toBe(0x00A4);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
  });

  describe('das', () => {
    test('msb >9, lsb >9', () => {
      cpu.reg16[regAX] = 0x00AD;
      cpu.mem8[0x00FF] = 0x2F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.das(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0047);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('msb <=9, lsb >9', () => {
      cpu.reg16[regAX] = 0x004B;
      cpu.mem8[0x00FF] = 0x2F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.das(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0045);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('msb >9, lsb <=9', () => {
      cpu.reg16[regAX] = 0x00B4;
      cpu.mem8[0x00FF] = 0x2F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.das(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0054);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
    test('msb <=9, lsb <=9', () => {
      cpu.reg16[regAX] = 0x0044;
      cpu.mem8[0x00FF] = 0x2F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.das(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0044);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('msb <=9, lsb <=9, AF set', () => {
      cpu.reg16[regFlags] = 0x0010; // AF Set
      cpu.reg16[regAX] = 0x0044;
      cpu.mem8[0x00FF] = 0x2F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.das(null, null);

      expect(cpu.reg16[regAX]).toBe(0x003E);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
    });
    test('msb <=9, lsb <=9, CF set', () => {
      cpu.reg16[regFlags] = 0x0001; // CF Set
      cpu.reg16[regAX] = 0x0088;
      cpu.mem8[0x00FF] = 0x2F;  // inst
      cpu.instIPInc = 1;
      cpu.decode();
      oper.das(null, null);

      expect(cpu.reg16[regAX]).toBe(0x0028);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
    });
  });

  describe('dec', () => {
    beforeEach(() => {
      // DEC AX
      cpu.mem8[0x00FF] = 0x48;
    });
    test('basic decrement', () => {
      cpu.reg16[regAX] = 0x1235;
      cpu.decode();
      oper.dec(addr.AX.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0x1234);
    });
    test('decrement top of value range', () => {
      cpu.reg16[regAX] = 0xFFFF;
      cpu.decode();
      oper.dec(addr.AX.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0xFFFE);
    });
    test('decrement to zero', () => {
      cpu.reg16[regAX] = 0x0001;
      cpu.decode();
      oper.dec(addr.AX.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0x0000);
    });

    test('decrement underflow', () => {
      cpu.reg16[regAX] = 0x0000;
      cpu.decode();
      oper.dec(addr.AX.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0xFFFF);
    });
  });

  describe('div', () => {
    test('8 bit divide accumulator (AL) by BL', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regAX] = 0x0030; // 48
      cpu.reg8[regBL]  = 0x04;   // 4

      cpu.decode();
      oper.div(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0x0C);     // 12 (quotient)
      expect(cpu.reg8[regAH]).toBe(0x00);     // 0  (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000);
    });
    test('8 bit divide accumulator (AL) by BL with remainder', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regAX] = 0x0030; // 48
      cpu.reg8[regBL]  = 0x05;   // 5

      cpu.decode();
      oper.div(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0x09);    // 9 (quotient)
      expect(cpu.reg8[regAH]).toBe(0x03);    // 3  (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000); // (DX not used in 8-bit division)
    });
    test('8 bit divide accumulator (AL, with sign bit) by CL with remainder', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xF1;   // Addr byte
      cpu.reg16[regAX] = 0xCE08; // 52744
      cpu.reg8[regCL]  = 0xFF;   // 255

      cpu.decode();
      oper.div(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xCE);    // 206 (quotient)
      expect(cpu.reg8[regAH]).toBe(0xD6);    // 214 (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000); // 0  (DX not used in 8-bit division)
    });
    test('8 bit divide by 0 should cause interrupt', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regAX] = 0x00D0; // -48
      cpu.reg8[regBL]  = 0x00;   // 0

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.div(addr.Eb.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('8 bit quotient overflow', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regAX] = 0x7D00; // 32000
      cpu.reg8[regBL]  = 0x02;   // 2

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.div(addr.Eb.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });

    test('16 bit divide accumulator (DX:AX) by BX', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regDX] = 0x32E3; //
      cpu.reg16[regAX] = 0x5800; // 853,760,000
      cpu.reg16[regBX] = 0x7D00; // 32,000

      cpu.decode();
      oper.div(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x6838); // 26,680 (quotient)
      expect(cpu.reg16[regDX]).toBe(0x0000); // 0      (remainder)
    });
    test('16 bit divide accumulator (DX:AX) by BX with remainder', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regDX] = 0x32E3; //
      cpu.reg16[regAX] = 0x5800; // 853,760,000
      cpu.reg16[regBX] = 0x7D01; // 32,001

      cpu.decode();
      oper.div(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x6837); // 26,679 (quotient)
      expect(cpu.reg16[regDX]).toBe(0x14C9); // 5,321    (remainder)
    });
    test('16 bit divide accumulator (DX:AX with sign bit) by BX', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regDX] = 0x800C; //
      cpu.reg16[regAX] = 0xA800; // 2,148,313,088
      cpu.reg16[regBX] = 0xF230; // 62,000

      cpu.decode();
      oper.div(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x875A); // 34650 (quotient)
      expect(cpu.reg16[regDX]).toBe(0x3320); // 13088  (remainder)
    });
    test('16 bit divide by 0 should cause interrupt', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regAX] = 0x12F0; // 4848
      cpu.reg16[regDX] = 0x0000; // (sign extended into DX)
      cpu.reg16[regBX] = 0x0000; // 0

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.div(addr.Ev.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('16 bit quotient overflow', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xF3;   // Addr byte
      cpu.reg16[regDX] = 0x32E3; //
      cpu.reg16[regAX] = 0x5800; // 853,760,000
      cpu.reg16[regBX] = 0x0002; // 2

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.div(addr.Ev.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
  });

  describe('ds', () => {
    test('DS sets addrSeg', () => {
      oper.ds();

      expect(cpu.addrSeg).toBe(regDS);
      expect(cpu.prefixSegmentState).toBe(STATE_SEG_DS);
    })
  });

  describe('es', () => {
    test('ES sets addrSeg', () => {
      oper.es();

      expect(cpu.addrSeg).toBe(regES);
      expect(cpu.prefixSegmentState).toBe(STATE_SEG_ES);
    })
  });

  describe('esc', () => {
    test('NOT IMPLEMENTED', () => {
      expect(() => {
        oper.esc();
      }).toThrowError(FeatureNotImplementedException);
    });
  });

  describe('hlt', () => {
    test('sets halt state', () => {
      oper.hlt();
      expect(cpu.state).toBe(STATE_HALT);
    });
  });

  describe('idiv', () => {
    test('8 bit divide accumulator (AL) by BL', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0x0030; // 48
      cpu.reg8[regBL]  = 0x04;   // 4

      cpu.decode();
      oper.idiv(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0x0C);     // 12 (quotient)
      expect(cpu.reg8[regAH]).toBe(0x00);     // 0  (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000);
    });
    test('8 bit divide accumulator (AL) by BL with remainder', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0x0030; // 48
      cpu.reg8[regBL]  = 0x05;   // 5

      cpu.decode();
      oper.idiv(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0x09);     // 9 (quotient)
      expect(cpu.reg8[regAH]).toBe(0x03);     // 3  (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000);  // (DX not used in 8-bit division)
    });
    test('8 bit negative divide accumulator (AL) by BL', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0xFFFC; // -4
      cpu.reg8[regBL]  = 0x04;   // 4

      cpu.decode();
      oper.idiv(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xFF);    // -1 (quotient)
      expect(cpu.reg8[regAH]).toBe(0x00);    // 0  (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000); // 0  (DX not used in 8-bit division)
    });
    test('8 bit negative divide accumulator (AL) by BL with remainder', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0xFFD0; // -48
      cpu.reg8[regBL]  = 0x05;   // 5

      cpu.decode();
      oper.idiv(addr.Eb.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xF7);    // -9 (quotient)
      expect(cpu.reg8[regAH]).toBe(0xFD);    // -3 (remainder)
      expect(cpu.reg16[regDX]).toBe(0x0000); // 0  (DX not used in 8-bit division)
    });
    test('8 bit divide by 0 should cause interrupt', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0x00D0; // -48
      cpu.reg8[regBL]  = 0x00;   // 0

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.idiv(addr.Eb.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('8 bit quotient overflow', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0x7D00; // 32000
      cpu.reg8[regBL]  = 0x02;   // 2

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.idiv(addr.Eb.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('8 bit quotient underflow', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0x8300; // -32000
      cpu.reg8[regBL]  = 0x02;   // 2

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.idiv(addr.Eb.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('16 bit divide accumulator (DX:AX) by BX', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regDX] = 0x32E3; //
      cpu.reg16[regAX] = 0x5800; // 853,760,000
      cpu.reg16[regBX] = 0x7D00; // 32,000

      cpu.decode();
      oper.idiv(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x6838); // 26,680 (quotient)
      expect(cpu.reg16[regDX]).toBe(0x0000); // 0      (remainder)
    });
    test('16 bit divide accumulator (DX:AX) by BX with remainder', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regDX] = 0x32E3; //
      cpu.reg16[regAX] = 0x5800; // 853,760,000
      cpu.reg16[regBX] = 0x7D01; // 32,001

      cpu.decode();
      oper.idiv(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x6837); // 26,679 (quotient)
      expect(cpu.reg16[regDX]).toBe(0x14C9); // 5,321    (remainder)
    });
    test('16 bit negative divide accumulator (DX:AX) by BX', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regDX] = 0xCD1C; //
      cpu.reg16[regAX] = 0xA800; // -853,760,000
      cpu.reg16[regBX] = 0x7D00; // 32,000

      cpu.decode();
      oper.idiv(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x97C8); // -26,680 (quotient)
      expect(cpu.reg16[regDX]).toBe(0x0000); //  0      (remainder)
    });
    test('16 bit negative divide accumulator (DX:AX) by BX with remainder', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regDX] = 0xCD1C; //
      cpu.reg16[regAX] = 0xA800; // -853,760,000
      cpu.reg16[regBX] = 0x7D01; // 32,001

      cpu.decode();
      oper.idiv(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x97C9); // -26,679 (quotient)
      expect(cpu.reg16[regDX]).toBe(0xEB37); // -5,321    (remainder)
    });
    test('16 bit divide by 0 should cause interrupt', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regAX] = 0x12F0; // 4848
      cpu.reg16[regDX] = 0x0000; // (sign extended into DX)
      cpu.reg16[regBX] = 0x0000; // 0

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.idiv(addr.Ev.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('16 bit quotient overflow', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regDX] = 0x32E3; //
      cpu.reg16[regAX] = 0x5800; // 853,760,000
      cpu.reg16[regBX] = 0x0002; // 2

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.idiv(addr.Ev.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
    test('16 bit quotient underflow', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xFB;   // Addr byte
      cpu.reg16[regDX] = 0xCD1C; //
      cpu.reg16[regAX] = 0xA800; // -853,760,000
      cpu.reg16[regBX] = 0x0002; // 2

      cpu.decode();

      // TODO: Implement interrupt testing
      expect(() => {
        oper.idiv(addr.Ev.bind(addr));
      }).toThrowError(TemporaryInterruptException);
    });
  });

  describe('imul', () => {
    test('8 bit multiply BL by accumulator (AL)', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6; // Inst
      cpu.mem8[0x0100] = 0xEB; // Addr byte
      cpu.reg8[regAL] = 0x30;  // 48
      cpu.reg8[regBL] = 0x04;  // 4

      cpu.decode();
      oper.imul(addr.Eb.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x00C0); // 192
      expect(cpu.reg16[regDX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('8 bit negative multiply BL by accumulator (AL)', () => {
      // IMUL BL
      cpu.mem8[0x00FF] = 0xF6; // Inst
      cpu.mem8[0x0100] = 0xEB; // Addr byte
      cpu.reg8[regAL] = 0xFC;  // -4
      cpu.reg8[regBL] = 0x04;  // 4

      cpu.decode();
      oper.imul(addr.Eb.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0xFFF0); // -16
      expect(cpu.reg16[regDX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
    test('16 bit multiply BX by accumulator (AX)', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xEB;   // Addr byte
      cpu.reg16[regAX] = 0x0030; // 48
      cpu.reg16[regBX] = 0x0004; // 4

      cpu.decode();
      oper.imul(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x00C0); // 192
      expect(cpu.reg16[regDX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('16 bit multiply CX by accumulator (AX) = 32 bit value', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xE9;   // Addr byte
      cpu.reg16[regAX] = 0x1234; // 4660
      cpu.reg16[regCX] = 0x1234; // 4660

      cpu.decode();
      oper.imul(addr.Ev.bind(addr));

      // Result = 21715600
      expect(cpu.reg16[regAX]).toBe(0x5A90);
      expect(cpu.reg16[regDX]).toBe(0x014B);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
    test('16 bit negative multiply CX by accumulator (AX) = 32 bit value', () => {
      // IMUL BX
      cpu.mem8[0x00FF] = 0xF7;   // Inst
      cpu.mem8[0x0100] = 0xE9;   // Addr byte
      cpu.reg16[regAX] = 0x1234; // 4660
      cpu.reg16[regCX] = 0xEDCC; // -4660

      cpu.decode();
      oper.imul(addr.Ev.bind(addr));

      // Result = -21715600 (2's complement)
      expect(cpu.reg16[regAX]).toBe(0xA570);
      expect(cpu.reg16[regDX]).toBe(0xFEB4);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
  });

  describe('in', () => {
    test('IN AL, 0xF8', () => {
      io.devices["TestDevice"].buffer8[0xF8] = 0xCC;
      cpu.mem8[0x00FF] = 0xE4;
      cpu.mem8[0x0100] = 0xF8;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.in(addr.AL.bind(addr), addr.Ib.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xCC);
    });
    test('IN AX, 0x4D', () => {
      io.devices["TestDevice"].buffer16[0x4D] = 0xBBCC;
      cpu.mem8[0x00FF] = 0xE5;
      cpu.mem8[0x0100] = 0x4D;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.in(addr.AX.bind(addr), addr.Ib.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0xBBCC);
    });
    test('IN AL, DX', () => {
      io.devices["TestDevice"].buffer8[0xF84E] = 0xFF;
      cpu.reg16[regDX] = 0xF84E;
      cpu.mem8[0x00FF] = 0xEC;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.in(addr.AL.bind(addr), addr.DX.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xFF);
    });
    test('IN AX, DX', () => {
      io.devices["TestDevice"].buffer16[0xF84E] = 0xBBCC;
      cpu.reg16[regDX] = 0xF84E;
      cpu.mem8[0x00FF] = 0xED;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.in(addr.AX.bind(addr), addr.DX.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0xBBCC);
    });
  });

  describe('inc', () => {
    beforeEach(() => {
      // INC AX
      cpu.mem8[0x00FF] = 0x40;
    });
    test('basic increment', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.decode();
      oper.inc(addr.AX.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1235);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('increment to top of value range', () => {
      cpu.reg16[regAX] = 0xFFFE;
      cpu.decode();
      oper.inc(addr.AX.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0xFFFF);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('increment from zero', () => {
      cpu.reg16[regAX] = 0x0000;
      cpu.decode();
      oper.inc(addr.AX.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x0001);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });

    test('increment overflow', () => {
      cpu.reg16[regAX] = 0xFFFF;
      cpu.decode();
      oper.inc(addr.AX.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('int', () => {
    beforeEach(() => {
      // setup a fake interupt vector table
      loadIVT(cpu);
      cpu.reg16[regFlags] = 0x55AA;
      cpu.reg16[regCS] = 0x0220;
    });
    test('INT 0x13', () => {
      cpu.mem8[0x022FF] = 0xCD; // inst (byte)
      cpu.mem8[0x02300] = 0x13; // arg

      cpu.decode();
      cpu.instIPInc = 1;
      oper.int(addr.Ib.bind(addr), null);

      // Flags on stack
      expect(cpu.mem8[0x401E]).toBe(0xAA);
      expect(cpu.mem8[0x401F]).toBe(0x55);
      // CS on stack
      expect(cpu.mem8[0x401C]).toBe(0x20);
      expect(cpu.mem8[0x401D]).toBe(0x02);
      // IP on stack
      expect(cpu.mem8[0x401A]).toBe(0x01);
      expect(cpu.mem8[0x401B]).toBe(0x01);
      // CS and IP updated to called location
      expect(cpu.reg16[regIP]).toBe(0xBC9A);
      expect(cpu.reg16[regCS]).toBe(0xF0DE);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
  });

  describe('into', () => {
    beforeEach(() => {
      // setup a fake interupt vector table
      loadIVT(cpu);
      cpu.reg16[regFlags] = 0x55AA;
      cpu.reg16[regCS] = 0x0220;
    });
    test('INTO no overflow', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.mem8[0x022FF] = 0xCE; // inst (byte)

      cpu.decode();
      cpu.instIPInc = 1;
      oper.into(addr.Ib.bind(addr), null);

      // Stack unchanged
      expect(cpu.mem8[0x401E]).toBe(0x00);
      expect(cpu.mem8[0x401F]).toBe(0x00);
      expect(cpu.mem8[0x401C]).toBe(0x00);
      expect(cpu.mem8[0x401D]).toBe(0x00);
      expect(cpu.mem8[0x401A]).toBe(0x00);
      expect(cpu.mem8[0x401B]).toBe(0x00);
      // CS and IP have not changed (the increment happens after instruction
      // execution)
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.reg16[regCS]).toBe(0x0220);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('INTO overflow', () => {
      cpu.reg16[regFlags] = 0b0101110110101010;
      cpu.mem8[0x022FF] = 0xCD; // inst (byte)
      cpu.mem8[0x02300] = 0x13; // arg

      cpu.decode();
      cpu.instIPInc = 1;
      oper.into(addr.Ib.bind(addr), null);

      // Flags on stack
      expect(cpu.mem8[0x401E]).toBe(0xAA);
      expect(cpu.mem8[0x401F]).toBe(0x5D);
      // CS on stack
      expect(cpu.mem8[0x401C]).toBe(0x20);
      expect(cpu.mem8[0x401D]).toBe(0x02);
      // IP on stack
      expect(cpu.mem8[0x401A]).toBe(0x00);
      expect(cpu.mem8[0x401B]).toBe(0x01);
      // CS and IP updated to called location
      expect(cpu.reg16[regIP]).toBe(0x3412);
      expect(cpu.reg16[regCS]).toBe(0x7856);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
  });

  describe('iret', () => {
    test('IRET', () => {
      cpu.mem8[0x022FF] = 0xCF; // inst (byte)
      cpu.reg16[regSP] = 0x01A;

      cpu.mem8[0x401F] = 0x55;
      cpu.mem8[0x401E] = 0xAA;
      cpu.mem8[0x401D] = 0x02;
      cpu.mem8[0x401C] = 0x20;
      cpu.mem8[0x401B] = 0x01;
      cpu.mem8[0x401A] = 0x01;

      cpu.decode();
      cpu.instIPInc = 1;
      oper.iret(null, null);

      expect(cpu.reg16[regIP]).toBe(0x0101);
      expect(cpu.reg16[regCS]).toBe(0x0220);
      expect(cpu.reg16[regFlags]).toBe(0x55AA);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
  });

  describe('ja', () => {
    beforeEach(() => {
      // JA Jb
      cpu.mem8[0x00FF] = 0x77;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes if ZF = 0, CF = 0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if ZF = 0, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if ZF = 1, CF = 0', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if ZF = 1, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000001000001;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jb', () => {
    beforeEach(() => {
      // JB Jb
      cpu.mem8[0x00FF] = 0x72;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes if CF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.jb(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if CF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jb(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jbe', () => {
    beforeEach(() => {
      // JA Jb
      cpu.mem8[0x00FF] = 0x76;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump does not execute if ZF = 0, CF = 0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if ZF = 0, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if ZF = 1, CF = 0', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if ZF = 1, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000001000001;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jcxz', () => {
    beforeEach(() => {
      // JCXZ Jb
      cpu.mem8[0x00FF] = 0xE3;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes if CX=1', () => {
      cpu.reg16[regCX] = 0x00;
      cpu.decode();
      oper.jcxz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if CX<>0', () => {
      cpu.reg16[regCX] = 0x01;
      cpu.decode();
      oper.jcxz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jg', () => {
    beforeEach(() => {
      // JG Jb
      cpu.mem8[0x00FF] = 0x76;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes if OF=0, SF=0, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=0, SF=0, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=0, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if OF=0, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000011000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=1, SF=0, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=1, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=1, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000100011000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jge', () => {
    beforeEach(() => {
      // JGE Jb
      cpu.mem8[0x00FF] = 0x7D;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes if SF=0, OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if SF=0, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if SF=1, OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if SF=1, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jl', () => {
    beforeEach(() => {
      // JL Jb
      cpu.mem8[0x00FF] = 0x7C;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump does not execute if SF=0, OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if SF=0, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if SF=1, OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if SF=1, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jle', () => {
    beforeEach(() => {
      // JLE Jb
      cpu.mem8[0x00FF] = 0x7E;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump does not execute if OF=0, SF=0, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=0, SF=0, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=0, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=0, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000011000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=1, SF=0, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if OF=1, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump executes if OF=1, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000100011000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jmp', () => {
    test('JMP Jv (near) positive offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xE9; // inst (byte)
      cpu.mem8[0x00100] = 0x34; // segment byte high
      cpu.mem8[0x00101] = 0x12; // segment byte low
      cpu.decode();
      oper.jmp(addr.Jv.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      // Near and short jumps reference IP after the jump instruction so
      // we add 3 (size of the instruction) to the expected result
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x1234 + 3);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('JMP Jv (near) negative offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xE9; // inst (byte)
      cpu.mem8[0x00100] = 0xF6; // segment byte high
      cpu.mem8[0x00101] = 0xFF; // segment byte low
      cpu.decode();
      oper.jmp(addr.Jv.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      // Near and short jumps reference IP after the jump instruction so
      // we add 3 (size of the instruction) to the expected result
      expect(cpu.reg16[regIP]).toBe(0xFF - 0x0A + 3);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('JMP Ap (far)', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xEA; // inst (byte)
      cpu.mem8[0x00100] = 0x78; // v1 high
      cpu.mem8[0x00101] = 0x56; // v1 low
      cpu.mem8[0x00102] = 0xBC; // v2 high
      cpu.mem8[0x00103] = 0x9A; // v2 low
      cpu.decode();
      oper.jmp(addr.Ap.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x9ABC);
      expect(cpu.reg16[regIP]).toBe(0x5678);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('JMP Jb (short) positive offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xEB; // inst (byte)
      cpu.mem8[0x00100] = 0x56; // v1 low
      cpu.decode();
      oper.jmp(addr.Jb.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      // Near and short jumps reference IP after the jump instruction so
      // we add 2 (size of the instruction) to the expected result
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x56 + 2);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('JMP Jb (short) negative offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xEB; // inst (byte)
      cpu.mem8[0x00100] = 0xF6; // v1 low
      cpu.decode();
      oper.jmp(addr.Jb.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      // Near and short jumps reference IP after the jump instruction so
      // we add 2 (size of the instruction) to the expected result
      expect(cpu.reg16[regIP]).toBe(0xFF - 0x0A + 2);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('JMP Ev (near)', () => {
      cpu.instIPInc = 2;
      cpu.mem8[0x000FF] = 0xFF; // inst (byte)
      cpu.mem8[0x00100] = 0b11100000; // addr mode
      cpu.reg16[regAX] = 0x1234;
      cpu.decode();
      oper.jmp(addr.Ev.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x1234);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('JMP Mp (far)', () => {
      cpu.instIPInc = 2;
      cpu.mem8[0x000FF] = 0xFF; // inst (byte)
      cpu.mem8[0x00100] = 0b00101100; // addr mode
      cpu.reg16[regSI] = 0x1234;
      cpu.mem8[0x04234] = 0x78; // v1 high
      cpu.mem8[0x04235] = 0x56; // v1 low
      cpu.mem8[0x04236] = 0xBC; // v2 high
      cpu.mem8[0x04237] = 0x9A; // v2 low
      cpu.decode();
      oper.jmp(addr.Mp.bind(addr), null);

      expect(cpu.reg16[regIP]).toBe(0x5678);
      expect(cpu.reg16[regCS]).toBe(0x9ABC);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });
  });

  describe('jnb', () => {
    beforeEach(() => {
      // JNB Jb
      cpu.mem8[0x00FF] = 0x73;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes CF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jnb(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if CF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.jnb(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jno', () => {
    beforeEach(() => {
      // JNO Jb
      cpu.mem8[0x00FF] = 0x71;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jno(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jno(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jns', () => {
    beforeEach(() => {
      // JNS Jb
      cpu.mem8[0x00FF] = 0x79;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes SF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jns(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if SF=1', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jns(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jnz', () => {
    beforeEach(() => {
      // JNZ Jb
      cpu.mem8[0x00FF] = 0x75;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jnz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jnz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jo', () => {
    beforeEach(() => {
      // JO Jb
      cpu.mem8[0x00FF] = 0x70;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jo(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jo(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jpe', () => {
    beforeEach(() => {
      // JPE Jb
      cpu.mem8[0x00FF] = 0x7A;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes PF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000100;
      cpu.decode();
      oper.jpe(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if PF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jpe(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jpo', () => {
    beforeEach(() => {
      // JPO Jb
      cpu.mem8[0x00FF] = 0x7B;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes PF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jpo(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if PF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000100;
      cpu.decode();
      oper.jpo(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('js', () => {
    beforeEach(() => {
      // JS Jb
      cpu.mem8[0x00FF] = 0x78;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes SF=1', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.js(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if SF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.js(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('jz', () => {
    beforeEach(() => {
      // JZ Jb
      cpu.mem8[0x00FF] = 0x74;
      cpu.mem8[0x0100] = 0x12;
      cpu.instIPInc = 1;
    });

    test('jump executes if ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });

    test('jump does not execute if if ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('lahf', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0x9F; // inst
      cpu.instIPInc = 1;
      cpu.decode();
    });

    test('load flags', () => {
      cpu.reg16[regFlags] = 0b0000000010010100;
      oper.lahf(null, null);

      expect(cpu.reg8[regAH]).toBe(0b10010100);
    });

    test('load flags with unused bits set', () => {
      cpu.reg16[regFlags] = 0b0000000010111110;
      oper.lahf(null, null);

      expect(cpu.reg8[regAH]).toBe(0b10010100);
    });
  });

  describe('lds', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xC5; // inst
    });

    test(' LDS Gv Mp', () => {
      cpu.mem8[0x0100] = 0b00000110; // addr mode
      cpu.mem8[0x0101] = 0x34; // segment byte high
      cpu.mem8[0x0102] = 0x12; // segment byte low

      cpu.mem8[0x04234] = 0x78; // v1 high
      cpu.mem8[0x04235] = 0x56; // v1 low
      cpu.mem8[0x04236] = 0xBC; // v2 high
      cpu.mem8[0x04237] = 0x9A; // v2 low

      cpu.instIPInc = 2;
      cpu.decode();
      oper.lds(addr.Gv.bind(addr), addr.Mp.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x5678);
      expect(cpu.reg16[regDS]).toBe(0x9ABC);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('lea', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0x8D; // inst
    });

    test(' LEA Gv M', () => {
      cpu.reg16[regBX] = 0x1234;
      cpu.mem8[0x0100] = 0b10010111; // addr
      cpu.mem8[0x0101] = 0x11; // oper high
      cpu.mem8[0x0102] = 0x22; // oper low
      cpu.instIPInc = 2;
      cpu.decode();
      oper.lea(addr.Gv.bind(addr), addr.M.bind(addr));

      expect(cpu.reg16[regDX]).toBe(0x1234 + 0x2211);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('les', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xC4; // inst
    });

    test(' LES Gv Mp', () => {
      cpu.mem8[0x0100] = 0b00000110; // addr mode
      cpu.mem8[0x0101] = 0x34; // segment byte high
      cpu.mem8[0x0102] = 0x12; // segment byte low

      cpu.mem8[0x04234] = 0x78; // v1 high
      cpu.mem8[0x04235] = 0x56; // v1 low
      cpu.mem8[0x04236] = 0xBC; // v2 high
      cpu.mem8[0x04237] = 0x9A; // v2 low

      cpu.instIPInc = 2;
      cpu.decode();
      oper.les(addr.Gv.bind(addr), addr.Mp.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x5678);
      expect(cpu.reg16[regES]).toBe(0x9ABC);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('lock', () => {
    test('NOT IMPLEMENTED', () => {
      expect(() => {
        oper.lock();
      }).toThrowError(FeatureNotImplementedException);
    });
  });

  describe('lodsb', () => {
    test('lodsb increment', () => {
      // 0x2345 * 0x10 + 0x5678
      cpu.mem8[0x28AC8] = 0x12;
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.mem8[0x00FF] = 0xAC;
      cpu.decode();
      oper.lodsb();

      expect(cpu.reg8[regAL]).toBe(0x12);
      expect(cpu.reg16[regSI]).toBe(0x5679);
    });
    test('lodsb decrement', () => {
      // 0x2345 * 0x10 + 0x5678
      cpu.mem8[0x28AC8] = 0x12;
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.mem8[0x00FF] = 0xAC;
      cpu.decode();
      oper.lodsb();

      expect(cpu.reg8[regAL]).toBe(0x12);
      expect(cpu.reg16[regSI]).toBe(0x5677);
    });
  });

  describe('lodsw', () => {
    test('lodsw increment', () => {
      // 0x2345 * 0x10 + 0x5678
      cpu.mem8[0x28AC8] = 0x34;
      cpu.mem8[0x28AC9] = 0x12;
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.mem8[0x00FF] = 0xAD;
      cpu.decode();
      oper.lodsw();

      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.reg16[regSI]).toBe(0x567A);
    });
    test('lodsw decrement', () => {
      // 0x2345 * 0x10 + 0x5678
      cpu.mem8[0x28AC8] = 0x34;
      cpu.mem8[0x28AC9] = 0x12;
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.mem8[0x00FF] = 0xAD;
      cpu.decode();
      oper.lodsw();

      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.reg16[regSI]).toBe(0x5676);
    });
  });

  describe('loopnz', () => {
    beforeEach(() => {
      // LOOPNZ Jb
      cpu.mem8[0x00FF] = 0xE0;
      cpu.instIPInc = 1;
    });

    test('LOOPNZ repeats positive offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF + 0x0012);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOPNZ repeats negative offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0xF6;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF - 0x0A);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOPNZ stops repeating if CX reaches 0', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOPNZ stops repeating if ZF is set', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('loopz', () => {
    beforeEach(() => {
      // LOOPZ Jb
      cpu.mem8[0x00FF] = 0xE1;
      cpu.instIPInc = 1;
    });

    test('LOOPZ repeats positive offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF + 0x0012);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOPZ repeats negative offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0xF6;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF - 0x0A);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOPZ stops repeating if CX reaches 0', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOPZ stops repeating if ZF is not set', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('loop', () => {
    beforeEach(() => {
      // LOOP Jb
      cpu.mem8[0x00FF] = 0xE2;
      cpu.instIPInc = 1;
    });

    test('LOOP repeats positive offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0x12;
      cpu.decode();
      oper.loop(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF + 0x0012);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOP repeats negative offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0xF6;
      cpu.decode();
      oper.loop(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF - 0x0A);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('LOOP stops repeating', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.decode();
      oper.loop(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
  });

  describe('mov', () => {
    beforeEach(() => {});

    test('MOV AX, iv', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x00FF] = 0xB8; // Inst
      cpu.mem8[0x0100] = 0x34; // Operand low
      cpu.mem8[0x0101] = 0x12; // Operand hight
      cpu.decode();
      oper.mov(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1234);
    });
    test('[regression] mov di, WORD PTR ds:0x1D3', () => {
      cpu.instIPInc = 2;
      cpu.mem8[0x00FF] = 0x8B; // Instruction
      cpu.mem8[0x0100] = 0x3E; // Addressing
      cpu.mem8[0x0101] = 0xD3; // Operand low
      cpu.mem8[0x0102] = 0x01; // Operand high
      // Data
      cpu.mem8[0x0031D3] = 0xCC;
      cpu.mem8[0x0031D4] = 0xBB;

      cpu.decode();
      oper.mov(addr.Gv.bind(addr), addr.Ev.bind(addr));

      expect(cpu.reg16[regDI]).toBe(0xBBCC);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('[regression] mov WORD [cursor], 80 * 5', () => {
      cpu.instIPInc = 2;
      cpu.mem8[0x00FF] = 0xC7; // Instruction
      cpu.mem8[0x0100] = 0x06; // Addressing
      cpu.mem8[0x0101] = 0xD3; // dst operand low
      cpu.mem8[0x0102] = 0x01; // dst operand high
      cpu.mem8[0x0103] = 0x90; // src operand low
      cpu.mem8[0x0104] = 0x01; // src operand high

      cpu.decode();
      oper.mov(addr.Ev.bind(addr), addr.Iv.bind(addr));

      expect(cpu.mem8[0x31D3]).toBe(0x90);
      expect(cpu.mem8[0x31D4]).toBe(0x01);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(4);
    });
    test('[regression] mov ES AX - where ES is Sw and Ax is Ew', () => {
      cpu.instIPInc = 2;
      cpu.mem8[0x00FF] = 0x8E; // Instruction
      cpu.mem8[0x0100] = 0xC0; // Addressing
      cpu.reg16[regAX] = 0xFFFF;
      cpu.reg16[regES] = 0x0000;

      cpu.decode();
      oper.mov(addr.Sw.bind(addr), addr.Ew.bind(addr));

      expect(cpu.reg16[regES]).toBe(0xFFFF);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
  });

  describe('movsb', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xAF;
      // ES:DI = 0x1234 * 0x10 + 0x3456 = 0x15796
      cpu.reg16[regES] = 0x1234;
      cpu.reg16[regDI] = 0x3456;
      cpu.mem8[0x15796] = 0x89;
      cpu.mem8[0x15797] = 0x67;
      // DS:SI = 0x2345 * 0x10 + 0x4567 = 0x279B7
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x4567;
      cpu.mem8[0x279B7] = 0x78;
      cpu.mem8[0x279B8] = 0x56;
      cpu.instIPInc = 1;
    });
    test('movsb increment', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.movsb();

      expect(cpu.mem8[0x15796]).toBe(0x78);
      expect(cpu.reg16[regDI]).toBe(0x3457);
      expect(cpu.reg16[regSI]).toBe(0x4568);
    });
    test('movsb decrement', () => {
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.decode();
      oper.movsb();

      expect(cpu.mem8[0x15796]).toBe(0x78);
      expect(cpu.reg16[regDI]).toBe(0x3455);
      expect(cpu.reg16[regSI]).toBe(0x4566);
    })
  });

  describe('movsw', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xAF;
      // ES:DI = 0x1234 * 0x10 + 0x3456 = 0x15796
      cpu.reg16[regES] = 0x1234;
      cpu.reg16[regDI] = 0x3456;
      cpu.mem8[0x15796] = 0x89;
      cpu.mem8[0x15797] = 0x67;
      // DS:SI = 0x2345 * 0x10 + 0x4567 = 0x279B7
      cpu.reg16[regDS] = 0x2345;
      cpu.reg16[regSI] = 0x4567;
      cpu.mem8[0x279B7] = 0x78;
      cpu.mem8[0x279B8] = 0x56;
      cpu.instIPInc = 1;
    });
    test('movsw increment', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.movsw();

      expect(cpu.mem8[0x15796]).toBe(0x78);
      expect(cpu.mem8[0x15797]).toBe(0x56);
      expect(cpu.reg16[regDI]).toBe(0x3458);
      expect(cpu.reg16[regSI]).toBe(0x4569);
    });
    test('movsw decrement', () => {
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.decode();
      oper.movsw();

      expect(cpu.mem8[0x15796]).toBe(0x78);
      expect(cpu.mem8[0x15797]).toBe(0x56);
      expect(cpu.reg16[regDI]).toBe(0x3454);
      expect(cpu.reg16[regSI]).toBe(0x4565);
    })
  });

  describe('mul', () => {
    test('multiply by zero', () => {
      // MUL BX
      cpu.reg16[regFlags] = 0xFFFF;
      cpu.mem8[0x00FF] = 0xF7; // Inst
      cpu.mem8[0x0100] = 0xE3; // Addr byte
      cpu.reg16[regAX] = 0x0112;
      cpu.reg16[regBX] = 0x0000;
      cpu.reg16[regDX] = 0xFFFF;

      cpu.decode();
      oper.mul(addr.Ev.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x0000);
      expect(cpu.reg16[regDX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('unsigned multiply', () => {
      // MUL BX
      cpu.reg16[regFlags] = 0x0000;
      cpu.mem8[0x00FF] = 0xF7; // Inst
      cpu.mem8[0x0100] = 0xE3; // Addr byte
      cpu.reg16[regAX] = 0x1234;
      cpu.reg16[regBX] = 0x2345;
      cpu.reg16[regDX] = 0xFFFF;

      cpu.decode();
      oper.mul(addr.Ev.bind(addr));

      // 0x1234 * 0x2345 = 0x2820404
      // => 0x0282, 0x0404
      expect(cpu.reg16[regAX]).toBe(0x0404);
      expect(cpu.reg16[regDX]).toBe(0x0282);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
  });

  describe('neg', () => {
    beforeEach(() => {
      // NEG Ev
      cpu.mem8[0x00FF] = 0xF7; // Inst
      cpu.mem8[0x0100] = 0b00011101; // Addr byte
      cpu.reg16[regDI] = 0x0222;
    });
    test('negate a positive number', () => {
      cpu.mem8[0x3222] = 0x34;
      cpu.mem8[0x3223] = 0x12;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.mem8[0x3222]).toBe(0xCC);
      expect(cpu.mem8[0x3223]).toBe(0xED);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('negate a negative number', () => {
      cpu.mem8[0x3222] = 0xCC;
      cpu.mem8[0x3223] = 0xED;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.mem8[0x3222]).toBe(0x34);
      expect(cpu.mem8[0x3223]).toBe(0x12);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('If the operand is zero, its sign is not changed', () => {
      cpu.mem8[0x3222] = 0x00;
      cpu.mem8[0x3223] = 0x00;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.mem8[0x3222]).toBe(0x00);
      expect(cpu.mem8[0x3223]).toBe(0x00);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('negate a byte -128 causes no change to operand and sets OF', () => {
      cpu.mem8[0x00FF] = 0xF6; // Change instruction to NEG Eb

      cpu.mem8[0x3222] = 0x80;
      // cpu.mem8[0x0223] = 0x00;
      cpu.decode();
      oper.neg(addr.Eb.bind(addr));

      expect(cpu.mem8[0x3222]).toBe(0x80);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
    test('negate a word -32,768 causes no change to operand and sets OF', () => {
      cpu.mem8[0x3222] = 0x00;
      cpu.mem8[0x3223] = 0x80;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.mem8[0x3222]).toBe(0x00);
      expect(cpu.mem8[0x3223]).toBe(0x80);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
  });

  describe('nop', () => {
    test('NOP changes nothing', () => {
      cpu.mem8[0x000FF] = 0x90; // inst (byte)
      cpu.instIPInc = 1;
      cpu.decode();
      oper.nop(null, null);

      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regDS]).toBe(0x0300);
      expect(cpu.reg16[regSS]).toBe(0x0400);
      expect(cpu.reg16[regSP]).toBe(0x0020);
      expect(cpu.reg16[regFlags]).toBe(0x0000);
      expect(cpu.instIPInc).toBe(1);
    });
  });

  describe('not', () => {
    test('NOT Ev', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x000FF] = 0xF7; // inst (byte)
      cpu.mem8[0x00100] = 0b11010000; // addr

      cpu.decode();
      oper.not(addr.Ev.bind(addr), null);

      expect(cpu.reg16[regAX]).toBe(0xEDCB);
      expect(cpu.instIPInc).toBe(0);
    });
  });
  describe('or', () => {
    test('OR AX Iv', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x000FF] = 0x0D; // inst (byte)
      cpu.mem8[0x00100] = 0x21; // oper low
      cpu.mem8[0x00101] = 0x34; // oper high
      cpu.instIPInc = 1;

      cpu.decode();
      oper.or(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x3635);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('out', () => {
    test('OUT 0xF8, AL', () => {
      cpu.reg8[regAL] = 0xBB;
      cpu.mem8[0x00FF] = 0xE6;
      cpu.mem8[0x0100] = 0xF8;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.out(addr.Ib.bind(addr), addr.AL.bind(addr));

      expect(io.devices["TestDevice"].buffer8[0xF8]).toBe(0xBB);
    });
    test('OUT 0xF8, AX', () => {
      cpu.reg16[regAX] = 0xBBCC;
      cpu.mem8[0x00FF] = 0xE7;
      cpu.mem8[0x0100] = 0xF8;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.out(addr.Ib.bind(addr), addr.AX.bind(addr));

      expect(io.devices["TestDevice"].buffer16[0xF8]).toBe(0xBBCC);
    });
    test('OUT DX, AL', () => {
      cpu.reg8[regAL] = 0xBB;
      cpu.reg16[regDX] = 0xF84E;
      cpu.mem8[0x00FF] = 0xEE;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.out(addr.DX.bind(addr), addr.AL.bind(addr));

      expect(io.devices["TestDevice"].buffer8[0xF84E]).toBe(0xBB);
    });
    test('OUT DX, AX', () => {
      cpu.reg16[regAX] = 0xBBCC;
      cpu.reg16[regDX] = 0xF84E;
      cpu.mem8[0x00FF] = 0xEF;
      cpu.instIPInc = 1;
      cpu.decode();
      oper.out(addr.DX.bind(addr), addr.AX.bind(addr));

      expect(io.devices["TestDevice"].buffer16[0xF84E]).toBe(0xBBCC);
    });
  });

  describe('pop', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('POP AX', () => {
      cpu.reg16[regSP] = 0x001E;
      cpu.mem8[0x000FF] = 0x58; // inst (byte)
      cpu.mem8[0x401E] = 0x34;
      cpu.mem8[0x401F] = 0x12;
      cpu.decode();
      oper.pop(addr.AX.bind(addr), null);

      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.reg16[regSP]).toBe(0x0020);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('popf', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('POPF', () => {
      cpu.reg16[regSP] = 0x001E;
      cpu.mem8[0x000FF] = 0x9D; // inst (byte)
      cpu.mem8[0x401E] = 0xDC;
      cpu.mem8[0x401F] = 0xFE;
      cpu.decode();
      oper.popf(null, null);

      expect(cpu.reg16[regFlags]).toBe(0xFEDC);
      expect(cpu.reg16[regSP]).toBe(0x0020);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('push', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('PUSH AX', () => {
      cpu.mem8[0x000FF] = 0x50; // inst (byte)
      cpu.reg16[regAX] = 0x1234;
      cpu.decode();
      oper.push(addr.AX.bind(addr), null);

      expect(cpu.mem8[0x401E]).toBe(0x34);
      expect(cpu.mem8[0x401F]).toBe(0x12);
      expect(cpu.reg16[regSP]).toBe(0x001E);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('pushf', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('PUSHF', () => {
      cpu.mem8[0x000FF] = 0x9C; // inst (byte)
      cpu.reg16[regFlags] = 0xFEDC;
      cpu.decode();
      oper.pushf(null, null);

      expect(cpu.mem8[0x401E]).toBe(0xDC);
      expect(cpu.mem8[0x401F]).toBe(0xFE);
      expect(cpu.reg16[regSP]).toBe(0x001E);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('rcl', () => {
    test('RCL Eb 1 no carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.reg8[regAL] = 0b11100011; // 0xE3
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11010000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.rcl(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0b11000110); // 0xC6
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(2);
    });
    test('RCL Eb 1 with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.reg8[regAL] = 0b11100011; // 0xE3
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11010000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.rcl(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0b11000111); // 0xC6
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('rcr', () => {
    test('RCR Eb 1 no carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.reg8[regAL] = 0b11100011; // 0xE3
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11011000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.rcr(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0b01110001); // 0xC6
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.instIPInc).toBe(2);
    });
    test('RCR Eb 1 with carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.reg8[regAL] = 0b11100011; // 0xE3
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11011000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.rcr(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0b11110001); // 0xC6
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('repnz', () => {
    test('repnz', () => {
      oper.repnz();

      expect(cpu.prefixRepeatState).toBe(STATE_REP_NZ);
    });
  });

  describe('repz', () => {
    test('repz - rep instruction', () => {
      cpu.mem8[0x000FF] = 0xF3; // REP
      cpu.mem8[0x00100] = 0xAB; // STOSW
      cpu.decode();
      oper.repz();

      expect(cpu.prefixRepeatState).toBe(STATE_REP);
    });
    test('repz - repz instruction', () => {
      cpu.mem8[0x000FF] = 0xF3; // REP
      cpu.mem8[0x00100] = 0xA6; // CMPSB
      cpu.decode();
      oper.repz();

      expect(cpu.prefixRepeatState).toBe(STATE_REP_Z);
    });
  });

  describe('ret', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('RET Iw', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xC2; // inst (byte)
      cpu.mem8[0x00100] = 0x01; // v1 high
      cpu.mem8[0x00101] = 0x01; // v1 low

      cpu.reg16[regSP] = 0x001E;
      cpu.mem8[0x401E] = 0x34; // Stack IP high
      cpu.mem8[0x401F] = 0x12; // Stack IP low
      cpu.decode();
      oper.ret(addr.Iw.bind(addr), null);

      expect(cpu.reg16[regIP]).toBe(0x1234 + 0x0101);
      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.instIPInc).toBe(0);
    });
    test('RET', () => {
      cpu.mem8[0x000FF] = 0xC3; // inst (byte)
      cpu.reg16[regSP] = 0x001E;
      cpu.mem8[0x401E] = 0x34; // Stack IP high
      cpu.mem8[0x401F] = 0x12; // Stack IP low
      cpu.decode();
      oper.ret(null, null);

      expect(cpu.reg16[regIP]).toBe(0x1234);
      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('retf', () => {
    beforeEach(() => {
      setMemory(cpu, 0xAA);
    });

    test('RETF Iw', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xCA; // inst (byte)
      cpu.mem8[0x00100] = 0x01; // v1 high
      cpu.mem8[0x00101] = 0x01; // v1 low

      cpu.reg16[regSP] = 0x001C;
      cpu.mem8[0x401E] = 0x02; // CS high
      cpu.mem8[0x401F] = 0x02; // CS low
      cpu.mem8[0x401C] = 0x34; // Stack IP high
      cpu.mem8[0x401D] = 0x12; // Stack IP low
      cpu.decode();
      oper.retf(addr.Iw.bind(addr), null);

      expect(cpu.reg16[regIP]).toBe(0x1234 + 0x0101);
      expect(cpu.reg16[regCS]).toBe(0x0202);
      expect(cpu.instIPInc).toBe(0);
      expect(cpu.addrIPInc).toBe(0);
    });

    test('RETF', () => {
      cpu.mem8[0x000FF] = 0xCB; // inst (byte)

      cpu.reg16[regSP] = 0x001C;
      cpu.mem8[0x401E] = 0x02; // CS high
      cpu.mem8[0x401F] = 0x02; // CS low
      cpu.mem8[0x401C] = 0x34; // Stack IP high
      cpu.mem8[0x401D] = 0x12; // Stack IP low
      cpu.decode();
      oper.retf(null, null);

      expect(cpu.reg16[regIP]).toBe(0x1234);
      expect(cpu.reg16[regCS]).toBe(0x0202);
      expect(cpu.instIPInc).toBe(0);
    });
  });

  describe('rol', () => {
    test('ROL Eb 1', () => {
      cpu.reg8[regAL] = 0b11100011; // 0xE3
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11000000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.rol(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0b11000111); // 0xC7
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('ror', () => {
    test('ROR Eb 1', () => {
      cpu.reg8[regAL] = 0b11100011; // 0xE3
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11001000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.ror(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0b11110001); // 0xF1
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });
  describe('sahf', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0x9E; // inst
      cpu.instIPInc = 1;
      cpu.decode();
    });

    test('set flags', () => {
      cpu.reg16[regFlags] = 0b0000000010010100; // 148 (0x94)
      cpu.reg8[regAH] = 0b00111101;             // 61 (0x3D)
      oper.sahf(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b00010101);  // 149 (0x95)
    });

    test('set flags to zero', () => {
      cpu.reg16[regFlags] = 0b0000100001010100;
      cpu.reg8[regAH] = 0b00000000;
      oper.sahf(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b0000100000000000);  // 149 (0x95)
    });
  });

  describe('sar', () => {
    test('SAR Eb 1', () => {
      cpu.reg8[regAL] = 0xE3;
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11111000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.sar(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xF1);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('sbb', () => {
    beforeEach(() => {
      // SBB AX,iv
      cpu.mem8[0x00FF] = 0x1D;
      cpu.instIPInc = 1;
    });
    test('dst > src', () => {
      //  0x1235 > 0x1234
      cpu.reg16[regAX] = 0x1235;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0x0001)
    });
    test('dst < src', () => {
      // 0x1234 > 0x1235
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x35;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0xFFFF)
    });
    test('dst = src', () => {
      // 0x1234 = 0x1234
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0x0000)
    });
    test('dst > src with overflow', () => {
      // 0x8000 > 0x0001
      cpu.reg16[regAX] = 0x8000;
      cpu.mem8[0x0100] = 0x01;
      cpu.mem8[0x0101] = 0x00;
      cpu.decode();
      oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regAX]).toBe(0x7FFF);
    });
    test('subtract with cf set', () => {
      // 0x8000 > 0x0001
      cpu.reg16[regAX] = 0x8000;
      cpu.mem8[0x0100] = 0x01;
      cpu.mem8[0x0101] = 0x00;
      cpu.reg16[regFlags] |= FLAG_CF_MASK;
      cpu.decode();
      oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regAX]).toBe(0x7FFE);
    });
  });

  describe('scasb', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xAE;
      // 0x2345 * 0x10 + 0x5678
      cpu.mem8[0x28AC8] = 0x34;
      cpu.reg8[regAL] = 0x12;
      cpu.reg16[regES] = 0x2345;
      cpu.reg16[regDI] = 0x5678;
      cpu.instIPInc = 1;
    });
    test('scasb increment', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.scasb();

      // 0x12 - 0x34 = 0xDE (-22)
      expect(cpu.reg16[regDI]).toBe(0x5679);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('stosb decrement', () => {
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.decode();
      oper.scasb();

      // 0x12 - 0x34 = 0xDE (-22)
      expect(cpu.reg16[regDI]).toBe(0x5677);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('scasw', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0xAF;
      // 0x2345 * 0x10 + 0x5678
      cpu.mem8[0x28AC8] = 0x45;
      cpu.mem8[0x28AC9] = 0x23;
      cpu.reg16[regAX] = 0x1234;
      cpu.reg16[regES] = 0x2345;
      cpu.reg16[regDI] = 0x5678;
      cpu.instIPInc = 1;
    });
    test('scasw increment', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.scasw();

      // 0x1234 - 0x2345 = 0xEEEF (-4369)
      expect(cpu.reg16[regDI]).toBe(0x567A);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
    test('scasw decrement', () => {
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.decode();
      oper.scasw();

      // 0x1234 - 0x2345 = 0xEEEF (-4369)
      expect(cpu.reg16[regDI]).toBe(0x5676);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('shl', () => {
    test('SHL Eb 1', () => {
      cpu.reg8[regAL] = 0xE2;
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11100000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.shl(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0xC4);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('shr', () => {
    test('SHR Eb 1', () => {
      cpu.reg8[regAL] = 0xE3;
      cpu.mem8[0x000FF] = 0xD0; // inst (byte)
      cpu.mem8[0x00100] = 0b11101000; // addr
      cpu.instIPInc = 2;

      cpu.decode();
      oper.shr(addr.Eb.bind(addr), addr._1.bind(addr));

      expect(cpu.reg8[regAL]).toBe(0x71);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('ss', () => {
    test('SS sets addrSeg', () => {
      oper.ss();

      expect(cpu.addrSeg).toBe(regSS);
      expect(cpu.prefixSegmentState).toBe(STATE_SEG_SS);
    })
  });

  describe('stc', () => {
    test('STC with CF clear', () => {
      cpu.reg16[regFlags] = 0b1111111111111110;
      cpu.mem8[0x000FF] = 0xF9; // inst (byte)
      cpu.decode();

      oper.stc(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111111111111111);
    });
  });

  describe('std', () => {
    test('STD with DF clear', () => {
      cpu.reg16[regFlags] = 0b1111101111111111;
      cpu.mem8[0x000FF] = 0xFD; // inst (byte)
      cpu.decode();

      oper.std(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111111111111111);
    });
  });

  describe('sti', () => {
    test('STIC with IF clear', () => {
      cpu.reg16[regFlags] = 0b1111110111111111;
      cpu.mem8[0x000FF] = 0xF9; // inst (byte)
      cpu.decode();

      oper.sti(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b1111111111111111);
    });
  });

  describe('stosb', () => {
    test('stosb increment', () => {
      cpu.reg8[regAL] = 0x12;
      cpu.reg16[regES] = 0x2345;
      cpu.reg16[regDI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.mem8[0x00FF] = 0xAA;
      cpu.decode();
      oper.stosb();

      // 0x2345 * 0x10 + 0x5678
      expect(cpu.mem8[0x28AC8]).toBe(0x12);
      expect(cpu.reg16[regDI]).toBe(0x5679);
    });
    test('stosb decrement', () => {
      cpu.reg8[regAL] = 0x12;
      cpu.reg16[regES] = 0x2345;
      cpu.reg16[regDI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.mem8[0x00FF] = 0xAA;
      cpu.decode();
      oper.stosb();

      // 0x2345 * 0x10 + 0x5678
      expect(cpu.mem8[0x28AC8]).toBe(0x12);
      expect(cpu.reg16[regDI]).toBe(0x5677);
    });
  });

  describe('stosw', () => {
    test('stosw increment', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.reg16[regES] = 0x2345;
      cpu.reg16[regDI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.mem8[0x00FF] = 0xAB;
      cpu.decode();
      oper.stosw();

      // 0x2345 * 0x10 + 0x5678
      expect(cpu.mem8[0x28AC8]).toBe(0x34);
      expect(cpu.mem8[0x28AC9]).toBe(0x12);
      expect(cpu.reg16[regDI]).toBe(0x567A);
    });
    test('stosw decrement', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.reg16[regES] = 0x2345;
      cpu.reg16[regDI] = 0x5678;
      cpu.reg16[regFlags] = 0b0000010000000000;
      cpu.mem8[0x00FF] = 0xAB;
      cpu.decode();
      oper.stosw();

      // 0x2345 * 0x10 + 0x5678
      expect(cpu.mem8[0x28AC8]).toBe(0x34);
      expect(cpu.mem8[0x28AC9]).toBe(0x12);
      expect(cpu.reg16[regDI]).toBe(0x5676);
    });
  });

  describe('sub', () => {
    beforeEach(() => {
      // SUB AX,iv
      cpu.mem8[0x00FF] = 0x2D;
      cpu.instIPInc = 1;
    });

    test('dst > src', () => {
      //  0x1235 > 0x1234
      cpu.reg16[regAX] = 0x1235;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0x0001);
    });
    test('dst < src', () => {
      // 0x1234 > 0x1235
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x35;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0xFFFF);
    });
    test('dst = src', () => {
      // 0x1234 = 0x1234
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.reg16[regAX]).toBe(0x0000);
    });
    test('dst > src with overflow', () => {
      // 0x8000 > 0x0001
      cpu.reg16[regAX] = 0x8000;
      cpu.mem8[0x0100] = 0x01;
      cpu.mem8[0x0101] = 0x00;
      cpu.decode();
      oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regAX]).toBe(0x7FFF);
    });
    test('[regression] immediate value for dst doesn\'t double count IP increments', () => {
      // Data (dst)
      cpu.mem8[0x31D3] = 0x78;
      cpu.mem8[0x31D4] = 0x56;
      // Reg (src)
      cpu.reg16[regDI] = 0x1234;

      // SUB Ev,Gv
      cpu.instIPInc = 2;
      cpu.mem8[0x00FF] = 0x29; // inst
      cpu.mem8[0x0100] = 0b00111110; // addr
      cpu.mem8[0x0101] = 0xD3; // oper low
      cpu.mem8[0x0102] = 0x01; // oper high

      cpu.decode();
      oper.sub(addr.Ev.bind(addr), addr.Gv.bind(addr));

      expect(cpu.mem8[0x31D3]).toBe(0x44);
      expect(cpu.mem8[0x31D4]).toBe(0x44);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
    });
  });

  describe('test', () => {
    test('TEST AX Iv', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x000FF] = 0xA9; // inst (byte)
      cpu.mem8[0x00100] = 0x21; // oper low
      cpu.mem8[0x00101] = 0x34; // oper high
      cpu.instIPInc = 1;

      cpu.decode();
      oper.test(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('wait', () => {
    test('sets halt state', () => {
      oper.wait();
      expect(cpu.state).toBe(STATE_WAIT);
    });
  });

  describe('xchg', () => {
    beforeEach(() => {
      cpu.instIPInc = 1;
    });
    test('exchange CX AX', () => {
      cpu.mem8[0x00FF] = 0x91; // addr
      cpu.reg16[regCX] = 0x1234;
      cpu.reg16[regAX] = 0x5678;
      cpu.decode();
      oper.xchg(addr.CX.bind(addr), addr.AX.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x5678);
      expect(cpu.reg16[regAX]).toBe(0x1234);
      expect(cpu.instIPInc).toBe(1);
    });
  });

  describe('xlat', () => {
    beforeEach(() => {
      // DS: 0x0300; 0x0300:0x0200 = 0x3200
      cpu.mem8[0x3200] = 0x01;
      cpu.mem8[0x3201] = 0x02;
      cpu.mem8[0x3202] = 0x03;
      cpu.mem8[0x3203] = 0x04;
      cpu.mem8[0x3204] = 0x05;
      cpu.mem8[0x3205] = 0x06;
      cpu.mem8[0x3206] = 0x07;
      cpu.mem8[0x3207] = 0x08;
      cpu.mem8[0x3208] = 0x09;
      cpu.mem8[0x3209] = 0x0A;
      cpu.mem8[0x320A] = 0x0B;
      cpu.mem8[0x320B] = 0x0C;
      cpu.mem8[0x320C] = 0x0D;
      cpu.mem8[0x320D] = 0x0E;
      cpu.mem8[0x320E] = 0x0F;
    })

    test('lookup first item', () => {
      cpu.reg8[regAL]   = 0x00;   // table index
      cpu.reg16[regBX]  = 0x0200; // beginning of table
      cpu.mem8[0x000FF] = 0xD7;   // inst (byte)

      cpu.decode();
      oper.xlat(null, null);

      expect(cpu.reg8[regAL]).toBe(0x01);
    });
    test('lookup last item', () => {
      cpu.reg8[regAL]   = 0x0E;   // table index
      cpu.reg16[regBX]  = 0x0200; // beginning of table
      cpu.mem8[0x000FF] = 0xD7;   // inst (byte)

      cpu.decode();
      oper.xlat(null, null);

      expect(cpu.reg8[regAL]).toBe(0x0F);
    });
  });

  describe('xor', () => {
    test('XOR AX Iv', () => {
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x000FF] = 0x35; // inst (byte)
      cpu.mem8[0x00100] = 0x21; // oper low
      cpu.mem8[0x00101] = 0x34; // oper high
      cpu.instIPInc = 1;

      cpu.decode();
      oper.xor(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x2615);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
  });

  describe('notimp', () => {
    test('not implemented throws', () => {
      // Not sure if I want this to throw or just move to the next instruction
      // For now it's more helpful to thow. Replace with the lower commented
      // section to switch behavior.
      expect(() => {
        oper.notimp();
      }).toThrowError(FeatureNotImplementedException);

      // cpu.mem8[0x00FF] = 0xC8;
      // cpu.decode();
      // oper.notimp();
      // expect(cpu.instIPInc).toBe(0);
    });
  });
});

describe('Utility methods', () => {
  let cpu, oper;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 2 ** 16,
      debug: false,
    }));
    oper = new Operations(cpu);
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;

    setMemory(cpu, 0xAA);
  });

  test.skip('correctSubtraction()', () => {});
  test.skip('correctAddition()', () => {});
  test.skip('setPF_FLAG()', () => {});
  test.skip('setSF_FLAG()', () => {});
  test.skip('setZF_FLAG()', () => {});
  test.skip('flagAdd()', () => {});
  test.skip('flagSub()', () => {});
});
