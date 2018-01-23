import CGA from '../../src/jsemu/emu/graphics/cga'

describe('CGA class', () => {
  test('instantiates', () => {
    expect(new CGA()).toBeInstanceOf(CGA);
  });
});