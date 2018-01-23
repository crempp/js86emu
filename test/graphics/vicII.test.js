import VICII from '../../src/jsemu/emu/graphics/vicII'

describe('VICII class', () => {
  test('instantiates', () => {
    expect(new VICII()).toBeInstanceOf(VICII);
  });
});