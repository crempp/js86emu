import CPU8086 from '../../../src/emu/cpu/8086';
import Addressing from '../../../src/emu/cpu/Addressing';
import CPUConfig from '../../../src/emu/cpu/CPUConfig';
import Operations from "../../../src/emu/cpu/Operations";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from '../../../src/emu/Constants';
import { ValueOverflowException } from "../../../src/emu/utils/Exceptions";
import {
  formatOpcode, hexString8, hexString16, hexString32, formatFlags,
  formatMemory, formatRegisters
} from "../../../src/emu/utils/Debug";
import {seg2abs, segIP} from "../../../src/emu/utils/Utils";

//   7   6   5   4   3   2   1   0
// +---+---+---+---+---+---+---+---+
// |     opcode            | d | w |
// +---+---+---+---+---+---+---+---+
// +---+---+---+---+---+---+---+---+
// |  mod  |    reg    |    r/m    |
// +---+---+---+---+---+---+---+---+
// console.log(
//   "INSTRUCTION: " + cpu.opcode.string + "\n" +
//   "opcode_byte: " + hexString16(cpu.mem8[segIP(cpu)]) + "\n" +
//   "CS:IP: " + hexString16(cpu.reg16[regCS]) + ":" + hexString16(cpu.reg16[regIP]) +  " -> " + hexString32(segIP(cpu)) + "\n" +
//   "MEMORY:\n" + formatMemory(cpu.mem8, segIP(cpu), segIP(cpu) + 7, 11) + "\n" +
//   "OPCODE:\n" + formatOpcode(cpu.opcode, 11) + "\n" +
//   "REGISTERS\n" + formatRegisters(cpu, 11)  + "\n" +
//   "FLAGS:\n" + formatFlags(cpu.reg16[regFlags], 10));

function clearMemory(cpu) {
  for (let i = 0; i < cpu.mem8.length; i++) {
    cpu.mem8[i] = 0;
  }
}

function setMemory(cpu, value) {
  for (let i = 0; i < cpu.mem8.length; i++) {
    cpu.mem8[i] = value;
  }
}

describe('Operation methods', () => {
  let cpu, addr, oper;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 2 ** 20
    }));
    oper = new Operations(cpu);
    addr = new Addressing(cpu);
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0300;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;
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
    test('dst (word) = src (byte) both are negative no carry', () => {
      cpu.reg16[regFlags] = 0b0000000000000010;
      cpu.reg16[regBX] = 0xFFFF;
      // ADC BX,iv
      // 0xFFFF + 0xFF = -1 + -1 + 1 = 0x1FFFF -> 0xFFFF
      cpu.mem8[0x00FF] = 0x83; // inst
      cpu.mem8[0x0100] = 0b11010011; // addr
      cpu.mem8[0x0101] = 0xFF; // oper low
      cpu.instIPInc = 2;
      cpu.decode();
      oper.adc(addr.Ev.bind(addr), addr.Ib.bind(addr));

      expect(cpu.reg16[regBX]).toBe(0xFFFE);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
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
    test('dst (word) = src (byte) both are negative', () => {
      // ADD BX,iv
      // 0xFFFF + 0xFF = -1 + -1
      cpu.reg16[regBX] = 0xFFFF;
      cpu.mem8[0x00FF] = 0x83; // inst
      cpu.mem8[0x0100] = 0b11000011; // addr
      cpu.mem8[0x0101] = 0xFF; // oper low
      cpu.instIPInc = 2;
      cpu.decode();
      oper.add(addr.Ev.bind(addr), addr.Ib.bind(addr));

      expect(cpu.reg16[regBX]).toBe(0xFFFE);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBeGreaterThan(0);
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
      expect(cpu.instIPInc).toBe(3);
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
      expect(cpu.reg16[regCS]).toBe(0x5678);
      expect(cpu.reg16[regIP]).toBe(0x9ABC);
      expect(cpu.instIPInc).toBe(5);
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
      expect(cpu.instIPInc).toBe(3);
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
      expect(cpu.instIPInc).toBe(3);
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

  describe.skip('cbw', () => {
    test('test 1', () => {

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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if ZF = 0, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if ZF = 1, CF = 0', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if ZF = 1, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000001000001;
      cpu.decode();
      oper.ja(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if CF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jb(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if ZF = 0, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if ZF = 1, CF = 0', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if ZF = 1, CF = 1', () => {
      cpu.reg16[regFlags] = 0b0000000001000001;
      cpu.decode();
      oper.jbe(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if CX<>0', () => {
      cpu.reg16[regCX] = 0x01;
      cpu.decode();
      oper.jcxz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=0, SF=0, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=0, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if OF=0, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000011000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=1, SF=0, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=1, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=1, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000100011000000;
      cpu.decode();
      oper.jg(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if SF=0, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if SF=1, OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if SF=1, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jge(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if SF=0, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if SF=1, OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if SF=1, OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jl(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=0, SF=0, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=0, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=0, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000011000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=1, SF=0, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if OF=1, SF=1, ZF=0', () => {
      cpu.reg16[regFlags] = 0b0000100010000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump executes if OF=1, SF=1, ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000100011000000;
      cpu.decode();
      oper.jle(addr.Jb.bind(addr), null);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x12);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x1234);
      expect(cpu.instIPInc).toBe(3);
    });
    test('JMP Jv (near) negative offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xE9; // inst (byte)
      cpu.mem8[0x00100] = 0xF6; // segment byte high
      cpu.mem8[0x00101] = 0xFF; // segment byte low
      cpu.decode();
      oper.jmp(addr.Jv.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0xFF - 0x0A);
      expect(cpu.instIPInc).toBe(3);
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

      expect(cpu.reg16[regCS]).toBe(0x5678);
      expect(cpu.reg16[regIP]).toBe(0x9ABC);
      expect(cpu.instIPInc).toBe(5);
    });
    test('JMP Jb (short) positive offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xEB; // inst (byte)
      cpu.mem8[0x00100] = 0x56; // v1 low
      cpu.decode();
      oper.jmp(addr.Jb.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0xFF + 0x56);
      expect(cpu.instIPInc).toBe(2);
    });
    test('JMP Jb (short) negative offset', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xEB; // inst (byte)
      cpu.mem8[0x00100] = 0xF6; // v1 low
      cpu.decode();
      oper.jmp(addr.Jb.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0xFF - 0x0A);
      expect(cpu.instIPInc).toBe(2);
    });
    test('JMP Ev (near)', () => {
      cpu.instIPInc = 1;
      cpu.mem8[0x000FF] = 0xFF; // inst (byte)
      cpu.mem8[0x00100] = 0b11100000; // addr mode
      cpu.reg16[regAX] = 0x1234;
      cpu.decode();
      oper.jmp(addr.Ev.bind(addr), null);

      expect(cpu.reg16[regCS]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x1234);
      expect(cpu.instIPInc).toBe(1);
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
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if CF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000001;
      cpu.decode();
      oper.jnb(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if OF=1', () => {
      cpu.reg16[regFlags] = 0b0000100000000000;
      cpu.decode();
      oper.jno(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if SF=1', () => {
      cpu.reg16[regFlags] = 0b0000000010000000;
      cpu.decode();
      oper.jns(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.jnz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if OF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jo(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if PF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jpe(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if PF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000100;
      cpu.decode();
      oper.jpo(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });

    test('jump does not execute if SF=0', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.js(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
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
    });

    test('jump does not execute if if ZF=1', () => {
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.jz(addr.Jb.bind(addr));
      expect(cpu.reg16[regIP]).toBe(0xFF);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('lahf', () => {
    beforeEach(() => {
      cpu.mem8[0x00FF] = 0x9F; // inst
      cpu.instIPInc = 1;
      cpu.decode();
    });

    test('load flags', () => {
      cpu.reg16[regFlags] = 0b0101010101111111;
      oper.lahf(null, null);

      expect(cpu.reg8[regAH]).toBe(0b01010111)
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
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOPNZ repeats negative offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0xF6;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF - 0x0A);
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOPNZ stops repeating if CX reaches 0', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOPNZ stops repeating if ZF is set', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopnz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOPZ repeats negative offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0xF6;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF - 0x0A);
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOPZ stops repeating if CX reaches 0', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000001000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOPZ stops repeating if ZF is not set', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.reg16[regFlags] = 0b0000000000000000;
      cpu.decode();
      oper.loopz(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(2);
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
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOP repeats negative offset', () => {
      cpu.reg16[regCX] = 0x0009;
      cpu.mem8[0x0100] = 0xF6;
      cpu.decode();
      oper.loop(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0008);
      expect(cpu.reg16[regIP]).toBe(0x00FF - 0x0A);
      expect(cpu.instIPInc).toBe(2);
    });
    test('LOOP stops repeating', () => {
      cpu.reg16[regCX] = 0x0001;
      cpu.mem8[0x0100] = 0x12;
      cpu.decode();
      oper.loop(addr.Jb.bind(addr));

      expect(cpu.reg16[regCX]).toBe(0x0000);
      expect(cpu.reg16[regIP]).toBe(0x00FF);
      expect(cpu.instIPInc).toBe(2);
    });
  });

  describe('mov', () => {
    beforeEach(() => {
      // MOV AX,iv
      cpu.mem8[0x00FF] = 0xB8;
      cpu.instIPInc = 1;
    });
    test('move word', () => {
      cpu.mem8[0x0100] = 0x34;
      cpu.mem8[0x0101] = 0x12;
      cpu.decode();
      oper.mov(addr.AX.bind(addr), addr.Iv.bind(addr));

      expect(cpu.reg16[regAX]).toBe(0x1234);
    });

    test('[regression] MOV Gv, Ev', () => {
      // mov di, WORD PTR ds:0x1D3
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
      expect(cpu.instIPInc).toBe(3);
    });
  });
  describe.skip('out', () => {
    test('test 1', () => {

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
  describe.skip('repnz', () => {
    test('test 1', () => {

    });
  });
  describe.skip('repz', () => {
    test('test 1', () => {

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
      expect(cpu.instIPInc).toBe(3);
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
      cpu.reg16[regFlags] = 0b0000000000000010;
      cpu.reg16[regAH] = 0b01111101;
      oper.sahf(null, null);

      expect(cpu.reg16[regFlags]).toBe(0b01010111)
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

  describe.skip('scasb', () => {
    test('test 1', () => {

    });
  });
  describe.skip('scasw', () => {
    test('test 1', () => {

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
  describe.skip('ss', () => {
    test('test 1', () => {

    });
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
    test('[regression] dst (word) = src (byte) both are negative', () => {
      // SUB BX,iv
      // 0xFFFF - 0xFF = -1 - -1
      cpu.instIPInc = 2;
      cpu.reg16[regBX] = 0xFFFF;
      cpu.mem8[0x00FF] = 0x83; // inst
      cpu.mem8[0x0100] = 0xFB; // addr
      cpu.mem8[0x0101] = 0xFF; // oper low
      cpu.decode();
      oper.sub(addr.Ev.bind(addr), addr.Ib.bind(addr));

      expect(cpu.reg16[regBX]).toBe(0x0000);
      expect(cpu.reg16[regFlags] & FLAG_CF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_PF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_AF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regFlags] & FLAG_SF_MASK).toBe(0);
      expect(cpu.reg16[regFlags] & FLAG_OF_MASK).toBe(0);
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
      expect(cpu.instIPInc).toBe(3);
    });
  });

  describe.skip('wait', () => {
    test('test 1', () => {

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

  describe.skip('xlat', () => {
    test('test 1', () => {

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
      expect(cpu.instIPInc).toBe(3);
    });
  });

  describe('notimp', () => {
    test('not implemented instruction moves to next instruction', () => {
      cpu.mem8[0x00FF] = 0xC8;
      cpu.decode();
      oper.notimp();
      expect(cpu.instIPInc).toBe(0);
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
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;

    setMemory(cpu, 0xAA);
  });

  test('push16()', () => {
    oper.push16(0x1234);

    expect(cpu.mem8[0x0401E]).toBe(0x34);
    expect(cpu.mem8[0x0401F]).toBe(0x12);
    expect(cpu.reg16[regSP]).toBe(0x001E);
  });
  test('pop16()', () => {
    cpu.mem8[0x0401E] = 0x34;
    cpu.mem8[0x0401F] = 0x12;
    cpu.reg16[regSP] = 0x001E;

    expect(oper.pop16()).toBe(0x1234);
    expect(cpu.reg16[regSP]).toBe(0x0020);
  });

  test.skip('pop16()', () => {});
  test.skip('correctUnderflow()', () => {});
  test.skip('correctOverflow()', () => {});
  test.skip('setPF_FLAG()', () => {});
  test.skip('setSF_FLAG()', () => {});
  test.skip('setZF_FLAG()', () => {});
  test.skip('flagAdd()', () => {});
  test.skip('flagSub()', () => {});

});

describe('Regressions', () => {
  let cpu, addr, oper;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 2 ** 20
    }));
    oper = new Operations(cpu);
    addr = new Addressing(cpu);
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0300;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;
    cpu.reg16[regFlags] = 0x0000;
  });
});
