import Settings from '../../src/jsemu/config/Settings'

describe('Settings class', () => {
  test('instantiates', () => {
    expect(new Settings()).toBeInstanceOf(Settings);
  });
});