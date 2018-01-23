import CPU6510 from '../../src/jsemu/emu/cpu/6510'

describe('CPU6510 class', () => {
  test('instantiates', () => {
    expect(new CPU6510()).toBeInstanceOf(CPU6510);
  });
});