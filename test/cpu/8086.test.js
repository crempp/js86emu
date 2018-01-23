import CPU8086 from '../../src/jsemu/emu/cpu/8086'

describe('CPU8086 class', () => {
  test('instantiates', () => {
    expect(new CPU8086()).toBeInstanceOf(CPU8086);
  });
});