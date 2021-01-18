import CPU8086 from '../../../src/emu/cpu/8086';
import SystemConfig from "../../../src/emu/config/SystemConfig";
import {
  regAX, regAL, regBX, regCS, regCX, regDI, regDS, regES,
  regBP, regSI, regSS, regIP, regFlags,
  FLAG_ZF_MASK, STATE_REP_NONE
} from "../../../src/emu/Constants";

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

describe('Segment prefix', () => {
  let cpu;
  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      debug: false,
    }));
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0300;
    cpu.reg16[regES] = 0x0400;
    cpu.reg16[regSS] = 0x0500;
    cpu.reg16[regFlags] = 0x0000;
  });

  test('MOV DI, WORD PTR CS:0x1D3', () => {
    cpu.instIPInc = 2;
    cpu.mem8[0x00FF] = 0x2E; // CS
    cpu.mem8[0x0100] = 0x8B; // MOV
    cpu.mem8[0x0101] = 0x3E; // Addressing
    cpu.mem8[0x0102] = 0xD3; // Operand low
    cpu.mem8[0x0103] = 0x01; // Operand high
    // Data
    // 0x0000 * 0x10 + 0x01D3 = 0x001D3
    cpu.mem8[0x001D3] = 0xCC;
    cpu.mem8[0x001D4] = 0xBB;

    cpu.cycle(); // CS Inst
    cpu.cycle(); // Mov Inst

    expect(cpu.reg16[regDI]).toBe(0xBBCC);
    expect(cpu.instIPInc).toBe(2);
    expect(cpu.addrIPInc).toBe(2);
  });
  test('MOV DI, WORD PTR DS:0x1D3', () => {
    cpu.instIPInc = 2;
    cpu.mem8[0x00FF] = 0x3E; // DS
    cpu.mem8[0x0100] = 0x8B; // MOV
    cpu.mem8[0x0101] = 0x3E; // Addressing
    cpu.mem8[0x0102] = 0xD3; // Operand low
    cpu.mem8[0x0103] = 0x01; // Operand high
    // Data
    // 0x0300 * 0x10 + 0x01D3 = 0x031D3
    cpu.mem8[0x031D3] = 0xCC;
    cpu.mem8[0x031D4] = 0xBB;

    cpu.cycle(); // DS Inst
    cpu.cycle(); // Mov Inst

    expect(cpu.reg16[regDI]).toBe(0xBBCC);
    expect(cpu.instIPInc).toBe(2);
    expect(cpu.addrIPInc).toBe(2);
  });
  test('MOV DI, WORD PTR ES:0x1D3', () => {
    cpu.instIPInc = 2;
    cpu.mem8[0x00FF] = 0x26; // ES
    cpu.mem8[0x0100] = 0x8B; // MOV
    cpu.mem8[0x0101] = 0x3E; // Addressing
    cpu.mem8[0x0102] = 0xD3; // Operand low
    cpu.mem8[0x0103] = 0x01; // Operand high
    // Data
    // 0x0400 * 0x10 + 0x01D3 = 0x041D3
    cpu.mem8[0x041D3] = 0xCC;
    cpu.mem8[0x041D4] = 0xBB;

    cpu.cycle(); // ES Inst
    cpu.cycle(); // Mov Inst

    expect(cpu.reg16[regDI]).toBe(0xBBCC);
    expect(cpu.instIPInc).toBe(2);
    expect(cpu.addrIPInc).toBe(2);
  });
  test('MOV DI, WORD PTR SS:0x1D3', () => {
    cpu.instIPInc = 2;
    cpu.mem8[0x00FF] = 0x36; // SS
    cpu.mem8[0x0100] = 0x8B; // MOV
    cpu.mem8[0x0101] = 0x3E; // Addressing
    cpu.mem8[0x0102] = 0xD3; // Operand low
    cpu.mem8[0x0103] = 0x01; // Operand high
    // Data
    // 0x0500 * 0x10 + 0x01D3 = 0x051D3
    cpu.mem8[0x051D3] = 0xCC;
    cpu.mem8[0x051D4] = 0xBB;

    cpu.cycle(); // SS Inst
    cpu.cycle(); // Mov Inst

    expect(cpu.reg16[regDI]).toBe(0xBBCC);
    expect(cpu.instIPInc).toBe(2);
    expect(cpu.addrIPInc).toBe(2);
  });
});


describe('Port IO', () => {
  let cpu;
  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      cpu: {
        registers16: [
          /* IP */ 0x00FF,
          /* CS */ 0x0000,
          /* DS */ 0x0300,
          /* ES */ 0x0400,
          /* SS */ 0x0500,
        ],
      },
      debug: false,
    }));
  });

  test('PIC - disable IRQ 6 (floppy controller) from firing', () => {
    let instructions = [
      0x66, 0xe5, 0x21,        // in   ax,   0x21
      0x66, 0x83, 0xc8, 0x40,  // or   ax,   0x40
      0x66, 0xe7, 0x21,        // out  0x21, ax

    ];
    loadMem(instructions, 0x00FF, cpu);
  });


});

describe('Regressions', () => {
  let cpu;
  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      debug: false,
    }));
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0300;
    cpu.reg16[regES] = 0x0400;
    cpu.reg16[regSS] = 0x0500;
    cpu.reg16[regFlags] = 0x0000;
  });
  test('[regression] Interrupt jumping to 2 bytes past the intended target', () => {
    cpu.instIPInc = 2;
    // IVT
    cpu.mem8[0x004C] = 0xAF;
    cpu.mem8[0x004D] = 0x0C;
    cpu.mem8[0x004E] = 0x00;
    cpu.mem8[0x004F] = 0xF0;

    // Jump location
    cpu.mem8[0xF0CAF] = 0x90;

    cpu.mem8[0x00FF] = 0xCD; // INT
    cpu.mem8[0x0100] = 0x13; // 0x13

    cpu.cycle(); // INT

    expect(cpu.reg16[regIP]).toBe(0x0CAF);
    expect(cpu.reg16[regCS]).toBe(0xF000);
  });
  test('[regression] MOV AX CS where AX is from Ew and CS is from Sw ', () => {
    cpu.reg16[regAX] = 0xFF23;
    cpu.reg16[regCS] = 0xF000;
    cpu.mem8[0xF00FF] = 0x8C; // MOV
    cpu.mem8[0xF0100] = 0xC8; // Addr

    cpu.cycle();

    expect(cpu.reg16[regAX]).toBe(0xF000);
  });
  test('[regression] AND AL 0b00110000 - IP increments correctly ', () => {
    cpu.reg16[regAX] = 0x0000;
    cpu.mem8[0x00FF] = 0x24; // AND
    cpu.mem8[0x0100] = 0x30; // Operand

    cpu.cycle();

    expect(cpu.reg8[regAL]).toBe(0x00);
    expect(cpu.reg16[regIP]).toBe(0x0101);
    expect(cpu.instIPInc).toBe(1);
    expect(cpu.instIPInc).toBe(1);
  });
  test('[regression] MOV BX, [BP+0] - BP uses SS segment ', () => {
    cpu.reg16[regBX] = 0x0000;
    cpu.reg16[regBP] = 0x00E6;
    cpu.reg16[regSS] = 0x0030;
    cpu.mem8[0x03E6] = 0x00;
    cpu.mem8[0x03E7] = 0xB0;

    cpu.mem8[0x00FF] = 0x8B; // MOV
    cpu.mem8[0x0100] = 0x5E; // Addr
    cpu.mem8[0x0101] = 0x00; // Operand


    cpu.cycle();

    expect(cpu.reg16[regBX]).toBe(0xB000);
    expect(cpu.instIPInc).toBe(2);
    expect(cpu.addrIPInc).toBe(1);
  });
  test('[regression] MOV BX, [BP+0] - BP does not use SS segment if override', () => {
    cpu.reg16[regBX] = 0x0000;
    cpu.reg16[regBP] = 0x00E6;
    cpu.reg16[regSS] = 0x0030;
    cpu.reg16[regES] = 0x0040;
    cpu.mem8[0x04E6] = 0x00;
    cpu.mem8[0x04E7] = 0xB0;

    cpu.mem8[0x00FF] = 0x26; // ES
    cpu.mem8[0x0100] = 0x8B; // MOV
    cpu.mem8[0x0101] = 0x5E; // Addr
    cpu.mem8[0x0102] = 0x00; // Operand

    cpu.cycle();
    cpu.cycle();

    expect(cpu.reg16[regBX]).toBe(0xB000);
    expect(cpu.instIPInc).toBe(2);
    expect(cpu.addrIPInc).toBe(1);
  });
});
