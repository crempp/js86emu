import SystemConfig from "../../../src/emu/config/SystemConfig";
import {SystemConfigException} from '../../../src/emu/utils/Exceptions';

test('config instantiates', () => {
  expect(new SystemConfig()).toBeInstanceOf(SystemConfig);
});

test('config ignores non-object initial parameter', () => {
  let config = new SystemConfig('asdf');
  expect(config.memorySize).toEqual(65536)
});

test('config ignores initial values that are not accepted', () => {
  let config = new SystemConfig({
    asdf: 1
  });
  expect(config.asdf).toBeUndefined()
});

test('config accepts memorySize as an initial value', () => {
  let config = new SystemConfig({
    memorySize: 2048
  });
  expect(config.memorySize).toEqual(2048)
});

test('memory size too small throws', () => {
  expect(() => {
    let config = new SystemConfig({
      memorySize: 0
    });
    config.validate();
  }).toThrowError(SystemConfigException);
});

test('memory size too large throws', () => {
  expect(() => {
    let config = new SystemConfig({
      memorySize: 2097152
    });
    config.validate();
  }).toThrowError(SystemConfigException);
});

test('non-number memory size throws', () => {
  expect(() => {
    let config = new SystemConfig({
      memorySize: "2097152"
    });
    config.validate();
  }).toThrowError(SystemConfigException);
});
