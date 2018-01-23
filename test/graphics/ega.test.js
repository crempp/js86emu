import EGA from '../../src/jsemu/emu/graphics/ega'

describe('EGA class', () => {
  test('instantiates', () => {
    expect(new EGA()).toBeInstanceOf(EGA);
  });
});