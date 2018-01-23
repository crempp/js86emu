import VGA from '../../src/jsemu/emu/graphics/vga'

describe('VGA class', () => {
  test('instantiates', () => {
    expect(new VGA()).toBeInstanceOf(VGA);
  });
});