import structuredClone from "core-js-pure/actual/structured-clone";
import CPU from "../../../src/emu/cpu/CPU";

describe("CPU shared functionality", () => {
  let cpu;

  let initialState = {
    "addrSeg":   5,
    "repType":   1,
    "instIPInc": 3,
    "addrIPInc": 2,
    "mem16":     new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8]),
    "reg16":     new Uint16Array([9, 8, 7, 6, 5, 4, 3, 2, 1]),
    "opcode":     {
      "opcode_byte":     0x12,
      "addressing_byte": 0x23,
      "prefix":          0x00,
      "opcode":          0xFC,
      "d":               0x01,
      "w":               0x00,
      "mod":             0x04,
      "reg":             0x03,
      "rm":              0x02,
      "inst":            null,
      "string":          "nop",
      "addrSize":        1,
      "isGroup":         false,
    },
    "state":              1,
    "prefixRepeatState":  0,
    "prefixSegmentState": 1,
  };

  beforeEach(() => {
    cpu = new CPU();
    cpu.inst = [];
    cpu.inst[0x12] = null;

    for (let key in initialState) {
      cpu[key] = initialState[key];
    }
  });

  test("set state", () => {
    let newState = structuredClone(initialState);
    newState.addrSeg = 16;
    cpu.setState(newState);

    expect(cpu.addrSeg).toBe(16);
  });

  test("get state", () => {
    let gottenState = cpu.getState();

    expect(gottenState).toStrictEqual(initialState);
  });
});