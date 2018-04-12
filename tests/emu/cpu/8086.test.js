import winston from 'winston'

import CPU8086 from '../../../src/emu/cpu/8086';
import {CPUConfigException} from '../../../src/emu/Exceptions';
import CPUConfig from "../../../src/emu/cpu/CPUConfig";

winston.level = 'warn';

test('can create a cpu instance', () => {
  expect(new CPU8086(new CPUConfig())).toBeInstanceOf(CPU8086);
});

test('undefined config throws', () => {
  expect(() => {
    let cpu = new CPU8086();
  }).toThrowError(CPUConfigException);
});

test('cpu validates config', () => {
  expect(() => {
    let cpu = new CPU8086(new CPUConfig({
      memorySize: 0
    }));
  }).toThrowError(CPUConfigException);
});

test('memory size respects config value', () => {
  let cpu = new CPU8086(new CPUConfig({
    memorySize: 131072
  }));
  expect(cpu.mem8.length).toEqual(131072);
  expect(cpu.mem16.length).toEqual(131072/2);
});

test('memory respects minimum value (1,024 bytes)', () => {
  let cpu = new CPU8086(new CPUConfig({
    memorySize: 1024
  }));
  expect(cpu.mem8.length).toEqual(1024);
  expect(cpu.mem16.length).toEqual(1024/2);
});

test('memory respects maximum value (1,048,576 bytes)', () => {
  let cpu = new CPU8086(new CPUConfig({
    memorySize: 1048576
  }));
  expect(cpu.mem8.length).toEqual(1048576);
  expect(cpu.mem16.length).toEqual(1048576/2);
});

test('instruction decodes', () => {

});
/*
 * Test TODOs
 *
 *  - memory fill
 *  - All instructions exist
 *  - register array access is correct
 */
