import winston from 'winston';

import CPUConfig from "../../../src/emu/cpu/CPUConfig";
import {CPUConfigException} from '../../../src/emu/utils/Exceptions';

winston.level = 'warn';

test('config instantiates', () => {
  expect(new CPUConfig()).toBeInstanceOf(CPUConfig);
});

test('config ignores non-object initial parameter', () => {
  let config = new CPUConfig('asdf');
  expect(config.memorySize).toEqual(65536)
});

test('config ignores initial values that are not accepted', () => {
  let config = new CPUConfig({
    asdf: 1
  });
  expect(config.asdf).toBeUndefined()
});

test('config accepts memorySize as an initial value', () => {
  let config = new CPUConfig({
    memorySize: 2048
  });
  expect(config.memorySize).toEqual(2048)
});

test('memory size too small throws', () => {
  expect(() => {
    let config = new CPUConfig({
      memorySize: 0
    });
    config.validate();
  }).toThrowError(CPUConfigException);
});

test('memory size too large throws', () => {
  expect(() => {
    let config = new CPUConfig({
      memorySize: 2097152
    });
    config.validate();
  }).toThrowError(CPUConfigException);
});

test('non-number memory size throws', () => {
  expect(() => {
    let config = new CPUConfig({
      memorySize: "2097152"
    });
    config.validate();
  }).toThrowError(CPUConfigException);
});
