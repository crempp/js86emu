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
    cpu.reg16[regFlags] = 0x0000;
  });

  describe.skip('aaa', () => {
    test('test 1', () => {

    });
  });
  describe.skip('aad', () => {
    test('test 1', () => {

    });
  });
  describe.skip('aam', () => {
    test('test 1', () => {

    });
  });
  describe.skip('aas', () => {
    test('test 1', () => {

    });
  });
  describe.skip('adc', () => {
    test('test 1', () => {

    });
  });
  describe.skip('add', () => {
    test('test 1', () => {

    });
  });
  describe.skip('and', () => {
    test('test 1', () => {

    });
  });
  describe.skip('call', () => {
    test('test 1', () => {

    });
  });
  describe.skip('cbw', () => {
    test('test 1', () => {

    });
  });
  describe.skip('clc', () => {
    test('test 1', () => {

    });
  });
  describe.skip('cld', () => {
    test('test 1', () => {

    });
  });
  describe.skip('cli', () => {
    test('test 1', () => {

    });
  });
  describe.skip('cmc', () => {
    test('test 1', () => {

    });
  });

  describe('cmp', () => {
    beforeEach(() => {
      // CMP AX,iv
      cpu.mem8[0x00FF] = 0x3D;
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
  });

  describe.skip('cmpsb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('cmpsw', () => {
    test('test 1', () => {

    });
  });
  describe.skip('cwd', () => {
    test('test 1', () => {

    });
  });
  describe.skip('daa', () => {
    test('test 1', () => {

    });
  });
  describe.skip('das', () => {
    test('test 1', () => {

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

  describe.skip('div', () => {
    test('test 1', () => {

    });
  });
  describe.skip('ds', () => {
    test('test 1', () => {

    });
  });
  describe.skip('es', () => {
    test('test 1', () => {

    });
  });
  describe.skip('hlt', () => {
    test('test 1', () => {

    });
  });
  describe.skip('idiv', () => {
    test('test 1', () => {

    });
  });
  describe.skip('imul', () => {
    test('test 1', () => {

    });
  });
  describe.skip('in', () => {
    test('test 1', () => {

    });
  });
  describe.skip('iin', () => {
    test('test 1', () => {

    });
  });
  describe.skip('inc', () => {
    test('test 1', () => {

    });
  });
  describe.skip('int', () => {
    test('test 1', () => {

    });
  });
  describe.skip('into', () => {
    test('test 1', () => {

    });
  });
  describe.skip('iret', () => {
    test('test 1', () => {

    });
  });
  describe.skip('ja', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jbe', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jg', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jge', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jl', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jle', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jmp', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jnb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jno', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jns', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jnz', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jo', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jpe', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jpo', () => {
    test('test 1', () => {

    });
  });
  describe.skip('js', () => {
    test('test 1', () => {

    });
  });
  describe.skip('jz', () => {
    test('test 1', () => {

    });
  });
  describe.skip('lahf', () => {
    test('test 1', () => {

    });
  });
  describe.skip('lds', () => {
    test('test 1', () => {

    });
  });
  describe.skip('lea', () => {
    test('test 1', () => {

    });
  });
  describe.skip('les', () => {
    test('test 1', () => {

    });
  });
  describe.skip('lock', () => {
    test('test 1', () => {

    });
  });
  describe.skip('lodsb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('lodsw', () => {
    test('test 1', () => {

    });
  });
  describe.skip('loopnz', () => {
    test('test 1', () => {

    });
  });
  describe.skip('loop', () => {
    test('test 1', () => {

    });
  });
  describe.skip('mov', () => {
    test('test 1', () => {

    });
  });
  describe.skip('movb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('movsb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('movsw', () => {
    test('test 1', () => {

    });
  });
  describe.skip('mul', () => {
    test('test 1', () => {

    });
  });

  describe('neg', () => {
    beforeEach(() => {
      // NEG Ev
      cpu.mem8[0x00FF] = 0xF7;
      cpu.mem8[0x0100] = 0x1D;

      cpu.reg16[regDI] = 0x0222;
    });
    test('negate a positive number', () => {
      cpu.mem8[0x0222] = 0x34;
      cpu.mem8[0x0223] = 0x12;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.mem8[0x0222]).toBe(0xCC);
      expect(cpu.mem8[0x0223]).toBe(0xED);
    });
    test('negate a negative number', () => {
      cpu.mem8[0x0222] = 0xCC;
      cpu.mem8[0x0223] = 0xED;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.mem8[0x0222]).toBe(0x34);
      expect(cpu.mem8[0x0223]).toBe(0x12);
    });
    test('If the operand is zero, its sign is not changed', () => {
      cpu.mem8[0x0222] = 0x00;
      cpu.mem8[0x0223] = 0x00;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
      expect(cpu.mem8[0x0222]).toBe(0x00);
      expect(cpu.mem8[0x0223]).toBe(0x00);
    });
    test('negate a byte -128 causes no change to operand and sets OF', () => {
      cpu.mem8[0x00FF] = 0xF6; // Change instruction to NEG Eb
      cpu.mem8[0x0222] = 0x80;
      // cpu.mem8[0x0223] = 0x00;
      cpu.decode();
      oper.neg(addr.Eb.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.mem8[0x0222]).toBe(0x80);
      // expect(cpu.mem8[0x0223]).toBe(0x00);
    });
    test('negate a word -32,768 causes no change to operand and sets OF', () => {
      cpu.mem8[0x0222] = 0x00;
      cpu.mem8[0x0223] = 0x80;
      cpu.decode();
      oper.neg(addr.Ev.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.mem8[0x0222]).toBe(0x00);
      expect(cpu.mem8[0x0223]).toBe(0x80);
    });
  });

  describe.skip('nop', () => {
    test('test 1', () => {

    });
  });
  describe.skip('not', () => {
    test('test 1', () => {

    });
  });
  describe.skip('or', () => {
    test('test 1', () => {

    });
  });
  describe.skip('out', () => {
    test('test 1', () => {

    });
  });
  describe.skip('pop', () => {
    test('test 1', () => {

    });
  });
  describe.skip('popf', () => {
    test('test 1', () => {

    });
  });
  describe.skip('push', () => {
    test('test 1', () => {

    });
  });
  describe.skip('pushf', () => {
    test('test 1', () => {

    });
  });
  describe.skip('rcl', () => {
    test('test 1', () => {

    });
  });
  describe.skip('rcr', () => {
    test('test 1', () => {

    });
  });
  describe.skip('repnz', () => {
    test('test 1', () => {

    });
  });
  describe.skip('repz', () => {
    test('test 1', () => {

    });
  });
  describe.skip('ret', () => {
    test('test 1', () => {

    });
  });
  describe.skip('retf', () => {
    test('test 1', () => {

    });
  });
  describe.skip('rol', () => {
    test('test 1', () => {

    });
  });
  describe.skip('ror', () => {
    test('test 1', () => {

    });
  });
  describe.skip('sahf', () => {
    test('test 1', () => {

    });
  });
  describe.skip('sar', () => {
    test('test 1', () => {

    });
  });

  describe('sbb', () => {
    beforeEach(() => {
      // SBB AX,iv
      cpu.mem8[0x00FF] = 0x1D;
    });
    test('dst > src', () => {
      //  0x1235 > 0x1234
      cpu.reg16[regAX] = 0x1235;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      let result = oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sbb(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regAX]).toBe(0x7FFE);
    });
  });

  describe.skip('scasb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('scasw', () => {
    test('test 1', () => {

    });
  });
  describe.skip('shl', () => {
    test('test 1', () => {

    });
  });
  describe.skip('shr', () => {
    test('test 1', () => {

    });
  });
  describe.skip('ss', () => {
    test('test 1', () => {

    });
  });
  describe.skip('stc', () => {
    test('test 1', () => {

    });
  });
  describe.skip('std', () => {
    test('test 1', () => {

    });
  });
  describe.skip('sti', () => {
    test('test 1', () => {

    });
  });
  describe.skip('stosb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('stosw', () => {
    test('test 1', () => {

    });
  });

  describe('sub', () => {
    beforeEach(() => {
      // SUB AX,iv
      cpu.mem8[0x00FF] = 0x2D;
    });
    test('dst > src', () => {
      //  0x1235 > 0x1234
      cpu.reg16[regAX] = 0x1235;
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      let result = oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

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
      let result = oper.sub(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regAX]).toBe(0x7FFF);
    });
  });

  describe.skip('test', () => {
    test('test 1', () => {

    });
  });
  describe.skip('wait', () => {
    test('test 1', () => {

    });
  });
  describe.skip('xchg', () => {
    test('test 1', () => {

    });
  });
  describe.skip('xlat', () => {
    test('test 1', () => {

    });
  });
  describe.skip('xor', () => {
    test('test 1', () => {

    });
  });
  describe.skip('notimp', () => {
    test('test 1', () => {

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
