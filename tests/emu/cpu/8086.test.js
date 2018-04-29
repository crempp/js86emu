import CPU8086 from '../../../src/emu/cpu/8086';
import SystemConfig from "../../../src/emu/config/SystemConfig";
import {FLAG_ZF_MASK, regAL, regAX, regCX, regDI, regDS, regES, regFlags, regIP, regSI, STATE_REP_NONE} from "../../../src/emu/Constants";

function loadMem (data, from, cpu) {
  for (let i = 0; i < data.length; i++) {
    cpu.mem8[from + i] = data[i];
  }
}

test('can create a cpu instance', () => {
  expect(new CPU8086(new SystemConfig({debug: false,})))
    .toBeInstanceOf(CPU8086);
});

test('memory size respects config value', () => {
  let cpu = new CPU8086(new SystemConfig({
    memorySize: 131072,
    debug: false,
  }));
  expect(cpu.mem8.length).toEqual(131072);
  expect(cpu.mem16.length).toEqual(131072/2);
});

test('memory respects minimum value (1,024 bytes)', () => {
  let cpu = new CPU8086(new SystemConfig({
    memorySize: 1024,
    debug: false,
  }));
  expect(cpu.mem8.length).toEqual(1024);
  expect(cpu.mem16.length).toEqual(1024/2);
});

test('memory respects maximum value (1,048,576 bytes)', () => {
  let cpu = new CPU8086(new SystemConfig({
    memorySize: 1048576,
    debug: false,
  }));
  expect(cpu.mem8.length).toEqual(1048576);
  expect(cpu.mem16.length).toEqual(1048576/2);
});

test('instruction decodes', () => {

});

describe('Repeat prefix', () => {
  describe('REP', () => {
    let cpu, dst, src;
    beforeEach(() => {
      dst = [
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
      ];
      src = [
        0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11,
        0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,
        0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21,
      ];

      cpu = new CPU8086(new SystemConfig({
        memorySize: 1048576,
        debug: false,
      }));

      // dst 0x1020
      cpu.reg16[regES] = 0x0100;
      cpu.reg16[regDI] = 0x0020;

      // src 0x2030
      cpu.reg16[regDS] = 0x0200;
      cpu.reg16[regSI] = 0x0030;

      cpu.reg16[regCX] = 0x0010;
      cpu.reg16[regAX] = 0xBBAA;

      // Fill noop instructions
      loadMem(Array(0x20).fill(0x90), 0x0000, cpu);

      // Destination Memory
      loadMem(dst, 0x01020, cpu);

      // Source Memory
      loadMem(src, 0x02030, cpu);
    });

    test('REP MOVSB', () => {
      cpu.mem8[0x00] = 0xF3; // REP
      cpu.mem8[0x01] = 0xA4; // MOVSB

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(Array.from(cpu.mem8.slice(0x01020, 0x01020 + 0x10)))
        .toEqual([
          0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
          0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11,
        ]);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REP MOVSW', () => {
      cpu.mem8[0x00] = 0xF3; // REP
      cpu.mem8[0x01] = 0xA5; // MOVSW

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(Array.from(cpu.mem8.slice(0x01020, 0x01020 + 0x20)))
        .toEqual([
          0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
          0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11,
          0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,
          0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21,
        ]);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REP LODSB', () => {
      cpu.mem8[0x00] = 0xF3; // REP
      cpu.mem8[0x01] = 0xAC; // LODSB

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
        expect(cpu.reg8[regAL]).toBe(src[i]);
      }
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REP LODSW', () => {
      cpu.mem8[0x00] = 0xF3; // REP
      cpu.mem8[0x01] = 0xAD; // LODSW

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
        let v = ((src[2*i+1] << 8) | src[2*i]);
        expect(cpu.reg16[regAX]).toBe(v);
      }
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REP STOSB', () => {
      cpu.mem8[0x00] = 0xF3; // REP
      cpu.mem8[0x01] = 0xAA; // STOSB

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(Array.from(cpu.mem8.slice(0x01020, 0x01020 + 0x10)))
        .toEqual([
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA
      ]);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REP STOSW', () => {
      cpu.mem8[0x00] = 0xF3; // REP
      cpu.mem8[0x01] = 0xAB; // STOSW

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(Array.from(cpu.mem8.slice(0x01020, 0x01020 + 0x20)))
        .toEqual([
          0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB,
          0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB,
          0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB,
          0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB, 0xAA, 0xBB
        ]);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
  });

  describe('REPZ', () => {
    let cpu, dst, src;
    beforeEach(() => {
      dst = [
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
      ];
      src = [
        0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11,
        0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,
        0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21,
      ];

      cpu = new CPU8086(new SystemConfig({
        memorySize: 1048576,
        debug: false,
      }));

      // dst 0x1020
      cpu.reg16[regES] = 0x0100;
      cpu.reg16[regDI] = 0x0020;

      // src 0x2030
      cpu.reg16[regDS] = 0x0200;
      cpu.reg16[regSI] = 0x0030;

      cpu.reg16[regCX] = 0x0010;
      cpu.reg16[regAX] = 0xBBAA;

      // Fill noop instructions
      loadMem(Array(0x20).fill(0x90), 0x0000, cpu);

      // Destination Memory
      loadMem(dst, 0x01020, cpu);

      // Source Memory
      loadMem(src, 0x02030, cpu);
    });
    test('REPZ CMPSB hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xA6; // CMPSB
      loadMem(src, 0x01020, cpu);
      cpu.mem8[0x02035] = 0x01;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x0A);
      expect(cpu.reg16[regIP]).toBe(0x0C);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ CMPSB no hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xA6; // CMPSB
      loadMem(src, 0x01020, cpu);

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ CMPSW hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xA7; // CMPSW
      loadMem(src, 0x01020, cpu);
      cpu.mem8[0x02036] = 0x01;
      cpu.mem8[0x02037] = 0x01;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x0C);
      expect(cpu.reg16[regIP]).toBe(0x0E);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ CMPSW no hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xA7; // CMPSW
      loadMem(src, 0x01020, cpu);

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ SCASB hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xAE; // SCASB
      cpu.reg8[regAL] = 0x01;
      cpu.mem8[0x01025] = 0x05;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x0A);
      expect(cpu.reg16[regIP]).toBe(0x0C);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ SCASB no hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xAE; // SCASB
      cpu.reg8[regAL] = 0x01;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ SCASW hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xAF; // SCASW
      cpu.reg16[regAX] = 0x0101;
      cpu.mem8[0x01025] = 0x05;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x0D);
      expect(cpu.reg16[regIP]).toBe(0x0F);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPZ SCASW no hit', () => {
      cpu.mem8[0x00] = 0xF3; // REPZ
      cpu.mem8[0x01] = 0xAF; // SCASW
      cpu.reg16[regAX] = 0x0101;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
  });

  describe('REPNZ', () => {
    let cpu, dst, src;
    beforeEach(() => {
      dst = [
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
      ];
      src = [
        0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11,
        0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,
        0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21,
      ];

      cpu = new CPU8086(new SystemConfig({
        memorySize: 1048576,
        debug: false,
      }));

      // dst 0x1020
      cpu.reg16[regES] = 0x0100;
      cpu.reg16[regDI] = 0x0020;

      // src 0x2030
      cpu.reg16[regDS] = 0x0200;
      cpu.reg16[regSI] = 0x0030;

      cpu.reg16[regCX] = 0x0010;
      cpu.reg16[regAX] = 0xBBAA;

      // Fill noop instructions
      loadMem(Array(0x20).fill(0x90), 0x0000, cpu);

      // Destination Memory
      loadMem(dst, 0x01020, cpu);

      // Source Memory
      loadMem(src, 0x02030, cpu);
    });
    test('REPNZ CMPSB hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xA6; // CMPSB
      cpu.mem8[0x02035] = 0x01;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x0A);
      expect(cpu.reg16[regIP]).toBe(0x0C);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPNZ CMPSB no hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xA6; // CMPSB

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPNZ CMPSW hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xA7; // CMPSW
      cpu.mem8[0x02036] = 0x01;
      cpu.mem8[0x02037] = 0x01;

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x0C);
      expect(cpu.reg16[regIP]).toBe(0x0E);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);

    });
    test('REPNZ CMPSW no hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xA7; // CMPSW

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPNZ SCASB hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xAE; // SCASB
      cpu.reg8[regAL] = 0x08;
      loadMem(src, 0x01020, cpu);

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x09);
      expect(cpu.reg16[regIP]).toBe(0x0B);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPNZ SCASB no hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xAE; // SCASB
      cpu.reg8[regAL] = 0xFF;
      loadMem(src, 0x01020, cpu);

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPNZ SCASW hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xAF; // SCASW
      cpu.reg16[regAX] = 0x0908;
      loadMem(src, 0x01020, cpu);

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBeGreaterThan(0);
      expect(cpu.reg16[regCX]).toBe(0x0C);
      expect(cpu.reg16[regIP]).toBe(0x0E);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
    test('REPNZ SCASW no hit', () => {
      cpu.mem8[0x00] = 0xF2; // REPNZ
      cpu.mem8[0x01] = 0xAF; // SCASW
      cpu.reg8[regAL] = 0xFFFF;
      loadMem(src, 0x01020, cpu);

      cpu.cycle();
      for (let i = 0; i < 0x10; i++) {
        cpu.cycle();
      }

      expect(cpu.reg16[regFlags] & FLAG_ZF_MASK).toBe(0);
      expect(cpu.reg16[regCX]).toBe(0x00);
      expect(cpu.reg16[regIP]).toBe(0x02);
      expect(cpu.prefixRepeatState).toBe(STATE_REP_NONE);
    });
  });
});
