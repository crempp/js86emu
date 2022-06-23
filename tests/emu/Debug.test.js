import CPU8086 from "../../src/emu/cpu/8086";
import SystemConfig from "../../src/emu/config/SystemConfig";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from "../../src/emu/Constants";
import {
  binString8, binString16, binString32,
  hexString8, hexString16, hexString32,
  formatOpcode, formatFlags, formatMemory, formatRegisters
} from "../../src/emu/utils/Debug";
import { ValueOverflowException, ValueUnderflowException } from "../../src/emu/utils/Exceptions";

describe("Debug helpers", () => {
  describe("binString8()", () => {
    test("binString8(0x00) should return \"00000000\"", () => {
      expect(binString8(0x00)).toBe("00000000");
    });
    test("binString8(0xFF) should return \"11111111\"", () => {
      expect(binString8(0xFF)).toBe("11111111");
    });
    test("binString8(0xAA) should return \"10101010\"", () => {
      expect(binString8(0xAA)).toBe("10101010");
    });
    test("binString8(0xFFFF) should throw ValueOverflowException", () => {
      expect(() => {
        let value = binString8(0xFFFF);
      }).toThrowError(ValueOverflowException);
    });
    test("binString8(-0x01) should throw ValueUnderflowException", () => {
      expect(() => {
        let value = binString8(-0x01);
      }).toThrowError(ValueUnderflowException);
    });
    test("binString8() should return \"NULL\"", () => {
      expect(binString8()).toBe("NULL");
    });
  });

  describe("binString16()", () => {
    test("binString16(0x0000) should return \"0000000000000000\"", () => {
      expect(binString16(0x0000)).toBe("0000000000000000");
    });
    test("binString16(0xFFFF) should return \"1111111111111111\"", () => {
      expect(binString16(0xFFFF)).toBe("1111111111111111");
    });
    test("binString16(0xAAAA) should return \"1010101010101010\"", () => {
      expect(binString16(0xAAAA)).toBe("1010101010101010");
    });
    test("binString16(0xFFFFFF) should throw ValueOverflowException", () => {
      expect(() => {
        let value = binString16(0xFFFFFF);
      }).toThrowError(ValueOverflowException);
    });
    test("binString16(-0x01) should throw ValueUnderflowException", () => {
      expect(() => {
        let value = binString16(-0x01);
      }).toThrowError(ValueUnderflowException);
    });
    test("binString16() should return \"NULL\"", () => {
      expect(binString16()).toBe("NULL");
    });
  });

  describe("binString32()", () => {
    test("binString32(0x00000000) should return \"00000000000000000000000000000000\"", () => {
      expect(binString32(0x00000000)).toBe("00000000000000000000000000000000");
    });
    test("binString32(0xFFFFFFFF) should return \"11111111111111111111111111111111\"", () => {
      expect(binString32(0xFFFFFFFF)).toBe("11111111111111111111111111111111");
    });
    test("binString32(0xAAAAAAAA) should return \"10101010101010101010101010101010\"", () => {
      expect(binString32(0xAAAAAAAA)).toBe("10101010101010101010101010101010");
    });
    test("binString32(0xFFFFFFFFFFF) should throw ValueOverflowException", () => {
      expect(() => {
        let value = binString32(0xFFFFFFFFFFF);
      }).toThrowError(ValueOverflowException);
    });
    test("binString32(-0x01) should throw ValueUnderflowException", () => {
      expect(() => {
        let value = binString32(-0x01);
      }).toThrowError(ValueUnderflowException);
    });
    test("binString32() should return \"NULL\"", () => {
      expect(binString32()).toBe("NULL");
    });
  });

  describe("hexString8()", () => {
    test("hexString8(0x00) should return \"0x00\"", () => {
      expect(hexString8(0x00)).toBe("0x00");
    });
    test("hexString8(0xFF) should return \"0xFF\"", () => {
      expect(hexString8(0xFF)).toBe("0xFF");
    });
    test("hexString8(0xAA) should return \"0xAA\"", () => {
      expect(hexString8(0xAA)).toBe("0xAA");
    });
    test("hexString8(0xFFFF) should throw ValueOverflowException", () => {
      expect(() => {
        let value = hexString8(0xFFFF);
      }).toThrowError(ValueOverflowException);
    });
    test("hexString8(-0x01) should throw ValueUnderflowException", () => {
      expect(() => {
        let value = hexString8(-0x01);
      }).toThrowError(ValueUnderflowException);
    });
    test("hexString8() should return \"NULL\"", () => {
      expect(hexString8()).toBe("NULL");
    });
  });

  describe("hexString16()", () => {
    test("hexString16(0x0000) should return \"0x0000\"", () => {
      expect(hexString16(0x0000)).toBe("0x0000");
    });
    test("hexString16(0xFFFF) should return \"0xFFFF\"", () => {
      expect(hexString16(0xFFFF)).toBe("0xFFFF");
    });
    test("hexString16(0xAAAA) should return \"0xAAAA\"", () => {
      expect(hexString16(0xAAAA)).toBe("0xAAAA");
    });
    test("hexString16(0xFFFFFFFF) should throw ValueOverflowException", () => {
      expect(() => {
        let value = hexString16(0xFFFFFFFF);
      }).toThrowError(ValueOverflowException);
    });
    test("hexString16(-0x01) should throw ValueUnderflowException", () => {
      expect(() => {
        let value = hexString16(-0x01);
      }).toThrowError(ValueUnderflowException);
    });
    test("hexString16() should return \"NULL\"", () => {
      expect(hexString16()).toBe("NULL");
    });
  });

  describe("hexString32()", () => {
    test("hexString32(0x00000000) should return \"0x00000000\"", () => {
      expect(hexString32(0x00000000)).toBe("0x00000000");
    });
    test("hexString32(0xFFFFFFFF) should return \"0xFFFFFFFF\"", () => {
      expect(hexString32(0xFFFFFFFF)).toBe("0xFFFFFFFF");
    });
    test("hexString32(0xAAAAAAAA) should return \"0xAAAAAAAA\"", () => {
      expect(hexString32(0xAAAAAAAA)).toBe("0xAAAAAAAA");
    });
    test("hexString32(0xFFFFFFFFF) should throw ValueOverflowException", () => {
      expect(() => {
        let value = hexString32(0xFFFFFFFFF);
      }).toThrowError(ValueOverflowException);
    });
    test("hexString32(-0x01) should throw ValueUnderflowException", () => {
      expect(() => {
        let value = hexString32(-0x01);
      }).toThrowError(ValueUnderflowException);
    });
    test("hexString32() should return \"NULL\"", () => {
      expect(hexString32()).toBe("NULL");
    });
  });

});

describe("Debug formatters", () => {
  let cpu, addr, segment;
  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576
    }));
    cpu.reg16[regAX] = 0x1234;
    cpu.reg16[regBX] = 0x2345;
    cpu.reg16[regCX] = 0x3456;
    cpu.reg16[regDX] = 0x4567;

    cpu.reg16[regSP] = 0x89AB;
    cpu.reg16[regBP] = 0x789A;
    cpu.reg16[regSI] = 0x5678;
    cpu.reg16[regDI] = 0x6789;

    cpu.reg16[regCS] = 0xABCD;
    cpu.reg16[regDS] = 0xBCD0;
    cpu.reg16[regES] = 0xCD01;
    cpu.reg16[regSS] = 0xD012;

    cpu.reg16[regIP] = 0x0000;

    cpu.mem8[0xABCD0] = 0x81;       // inst (byte)
    cpu.mem8[0xABCD1] = 0b10101010; // addr mode
    cpu.mem8[0xABCD2] = 0x01;
    cpu.mem8[0xABCD3] = 0x12;
    cpu.mem8[0xABCD4] = 0x23;
    cpu.mem8[0xABCD5] = 0x34;
    cpu.mem8[0xABCD6] = 0x45;
    cpu.mem8[0xABCD7] = 0x56;

    segment = cpu.reg16[regCS];
    cpu.decode();
  });

  describe("formatOpcode()", () => {
    test("formatOpcode() should return correctly formatted string", () => {
      expect(formatOpcode(cpu.opcode)).toBe(
        "opcode:  10000001[0x81]    address: 10101010[0xAA]prefix:  00000000[0x00]    \n" +
        "d:              0[0x00]    w:              1[0x01]           size:           v\n" +
        "mod:           10[0x02]    reg:          101[0x05]rm:           010[0x02]    ");
    });

    test("formatOpcode() should indent formatted string", () => {
      expect(formatOpcode(cpu.opcode, 4)).toBe(
        "opcode:  10000001[0x81]    address: 10101010[0xAA]    prefix:  00000000[0x00]    \n" +
        "    d:              0[0x00]    w:              1[0x01]           size:           v\n" +
        "    mod:           10[0x02]    reg:          101[0x05]    rm:           010[0x02]    ");
    });

    test("formatOpcode() should return correctly formatted string for byte", () => {
      cpu.mem8[0xABCD0] = 0x88;       // inst (byte)
      cpu.decode();
      expect(formatOpcode(cpu.opcode)).toBe(
        "opcode:  10001000[0x88]    address: 10101010[0xAA]prefix:  00000000[0x00]    \n" +
        "d:              0[0x00]    w:              0[0x00]           size:           b\n" +
        "mod:           10[0x02]    reg:          101[0x05]rm:           010[0x02]    ");
    });

    test("formatOpcode() should return correctly formatted string for word", () => {
      cpu.mem8[0xABCD0] = 0x8C;       // inst (byte)
      cpu.decode();
      expect(formatOpcode(cpu.opcode)).toBe(
        "opcode:  10001100[0x8C]    address: 10101010[0xAA]prefix:  00000000[0x00]    \n" +
        "d:              0[0x00]    w:              0[0x00]           size:           w\n" +
        "mod:           10[0x02]    reg:          101[0x05]rm:           010[0x02]    ");
    });

    test("formatOpcode() should handle null addressing byte", () => {
      cpu.mem8[0xABCD0] = 0x0E;       // inst (byte)
      cpu.mem8[0xABCD1] = 0x00;       // addr mode
      cpu.decode();
      expect(formatOpcode(cpu.opcode)).toBe(
        "opcode:  00001110[0x0E]    address:         [NULL]prefix:  00000000[0x00]    \n" +
        "d:              1[0x01]    w:              0[0x00]           size:           w\n" +
        "mod:             [NULL]    reg:             [NULL]rm:              [NULL]    ");
    });
  });

  describe("formatMemory()", () => {
    test("formatMemory() should return correctly formatted string", () => {
      expect(formatMemory(cpu.mem8, 0xABCD0, 0xABCD7)).toBe(
        "[0x000ABCD0]: 0x81    [0x000ABCD1]: 0xAA    [0x000ABCD2]: 0x01    [0x000ABCD3]: 0x12\n" +
        "[0x000ABCD4]: 0x23    [0x000ABCD5]: 0x34    [0x000ABCD6]: 0x45    [0x000ABCD7]: 0x56"
      );
    });
    test("formatMemory() should indent formatted string", () => {
      expect(formatMemory(cpu.mem8, 0xABCD0, 0xABCD7, 4)).toBe(
        "    [0x000ABCD0]: 0x81    [0x000ABCD1]: 0xAA    [0x000ABCD2]: 0x01    [0x000ABCD3]: 0x12\n" +
        "    [0x000ABCD4]: 0x23    [0x000ABCD5]: 0x34    [0x000ABCD6]: 0x45    [0x000ABCD7]: 0x56"
      );
    });
  });

  describe("formatRegisters()", () => {
    test("formatRegisters() should return correctly formatted string", () => {
      cpu.reg16[regIP] = 0xF123;
      expect(formatRegisters(cpu)).toBe(
        "IP: 0xF123\n" +
          "AX: 0x1234 | AL: 0x34 AH: 0x12 || CS: 0xABCD || SI: 0x5678 ||\n" +
          "BX: 0x2345 | BL: 0x45 BH: 0x23 || DS: 0xBCD0 || DI: 0x6789 ||\n" +
          "CX: 0x3456 | CL: 0x56 CH: 0x34 || ES: 0xCD01 || BP: 0x789A ||\n" +
          "DX: 0x4567 | DL: 0x67 DH: 0x45 || SS: 0xD012 || SP: 0x89AB ||");
    });
    test("formatRegisters() should indent formatted string", () => {
      cpu.reg16[regIP] = 0xF123;
      expect(formatRegisters(cpu, 4)).toBe(
        "    IP: 0xF123\n" +
          "    AX: 0x1234 | AL: 0x34 AH: 0x12 || CS: 0xABCD || SI: 0x5678 ||\n" +
          "    BX: 0x2345 | BL: 0x45 BH: 0x23 || DS: 0xBCD0 || DI: 0x6789 ||\n" +
          "    CX: 0x3456 | CL: 0x56 CH: 0x34 || ES: 0xCD01 || BP: 0x789A ||\n" +
          "    DX: 0x4567 | DL: 0x67 DH: 0x45 || SS: 0xD012 || SP: 0x89AB ||");
    });
  });

  describe("formatFlags()", () => {
    test("formatFlags() should return correctly formatted string", () => {
      expect(formatFlags(cpu.reg16[regFlags])).toBe("OF: 0 DF: 0 IF: 0 TF: 0 SF: 0 ZF: 0 AF: 0 PF: 0 CF: 0");
    });
    test("formatFlags() should indent formatted string", () => {
      expect(formatFlags(cpu.reg16[regFlags], 4)).toBe("    OF: 0 DF: 0 IF: 0 TF: 0 SF: 0 ZF: 0 AF: 0 PF: 0 CF: 0");
    });
  });
});
