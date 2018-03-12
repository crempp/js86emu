import CPU8086 from '../../src/emu/8086';
import Addressing from '../../src/emu/Addressing';
import CPUConfig from '../../src/emu/CPUConfig';
import Operations from "../../src/emu/Operations";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from '../../src/emu/Constants';
import { ValueOverflowException } from "../../src/emu/Exceptions";
import {
  formatOpcode, hexString8, hexString16, hexString32, formatFlags,
  formatMemory, formatRegisters
} from "../../src/emu/Debug";
import {segIP} from "../../src/emu/Utils";

//   7   6   5   4   3   2   1   0
// +---+---+---+---+---+---+---+---+
// |     opcode            | d | w |
// +---+---+---+---+---+---+---+---+
// +---+---+---+---+---+---+---+---+
// |  mod  |    reg    |    r/m    |
// +---+---+---+---+---+---+---+---+
// console.log(
//   "INSTRUCTION: " +  cpu.opcode.string + "\n" +
//   "opcode_byte: " + hexString16(cpu.mem8[segIP(cpu)]) + "\n" +
//   "CS:IP: " + hexString16(cpu.reg16[regCS]) + ":" + hexString16(cpu.reg16[regIP]) +  " -> " + hexString32(segIP(cpu)) + "\n" +
//   "MEMORY:\n" + formatMemory(cpu.mem8, segIP(cpu), segIP(cpu) + 7, 11) + "\n" +
//   "OPCODE:\n" + formatOpcode(cpu.opcode, 11) + "\n" +
//   "REGISTERS\n" + formatRegisters(cpu, 11)  + "\n" +
//   "FLAGS:\n" + formatFlags(cpu.reg16[regFlags], 10));

describe('Operation methods', () => {
  let cpu, addr, oper;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 2 ** 16
    }));
    oper = new Operations(cpu);
    addr = new Addressing(cpu);
    cpu.reg16[regIP] = 0x00FF;

    // CMP AX,iw
    cpu.mem8[0x00FF] = 0x3D;
  });

  describe('cmp', () => {
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
      cpu.reg16[regAX] = 0x1234;
      cpu.mem8[0x0100] = 0x35;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.cmp(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
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
      // 0x8000 > 0x0001
      cpu.reg16[regAX] = 0x8000;
      cpu.mem8[0x0100] = 0x01;
      cpu.mem8[0x0101] = 0x00;
      cpu.decode();
      oper.cmp(addr.AX.bind(addr), addr.Iv.bind(addr));

      console.log(
        "INSTRUCTION: " +  cpu.opcode.string + "\n" +
        "opcode_byte: " + hexString16(cpu.mem8[segIP(cpu)]) + "\n" +
        "CS:IP: " + hexString16(cpu.reg16[regCS]) + ":" + hexString16(cpu.reg16[regIP]) +  " -> " + hexString32(segIP(cpu)) + "\n" +
        "MEMORY:\n" + formatMemory(cpu.mem8, segIP(cpu), segIP(cpu) + 7, 11) + "\n" +
        "OPCODE:\n" + formatOpcode(cpu.opcode, 11) + "\n" +
        "REGISTERS\n" + formatRegisters(cpu, 11)  + "\n" +
        "FLAGS:\n" + formatFlags(cpu.reg16[regFlags], 10));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
    });
  });
});

describe('Utility methods', () => {
  let cpu, oper;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 2 ** 16
    }));
    oper = new Operations(cpu);
    cpu.reg16[regIP] = 0x00FF;
  });

  describe('shortJump()', () => {
    test('jump forward', () => {
      oper.shortJump(0x01);
      expect(cpu.reg16[regIP]).toBe(0x0100);
    });
    test('jump backward', () => {
      oper.shortJump(0xFFFF);
      expect(cpu.reg16[regIP]).toBe(0x00FE);
    });
  });
});
