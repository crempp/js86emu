import Config from '../src/jsemu/config/Config'
import Settings from '../src/jsemu/config/Settings'

/**
 * Setting tests
 */
describe('Settings class', () => {
  test('instantiates', () => {
    expect(new Settings()).toBeInstanceOf(Settings);
  });

});

/**
 * Config tests
 */
describe('Config class', () => {
  test('instantiates', () => {
    expect(new Config()).toBeInstanceOf(Config);
  });

  test('has attributes', () => {
    let c = new Config();
    expect(c.settings).toBeInstanceOf(Settings);
    expect(c.systems).toBeInstanceOf(Object);
    expect(c.components).toBeInstanceOf(Object);
    expect(c.program_fragments).toBeInstanceOf(Object);
  });
});