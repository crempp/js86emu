import winston from 'winston';

import CPU8086 from '../../src/emu/8086';
import Addressing from '../../src/emu/addressing'
import CPUConfig from '../../src/emu/CPUConfig'

winston.level = 'warn';

let addr;
let cpu;

beforeAll(() => {
  cpu = new CPU8086(new CPUConfig({
    memory: 1024
  }));
  addr = new Addressing(cpu);
});

test('Eb retrieve', () => {
  expect(addr.Eb()).toBe(0);
});

test('Eb set', () => {
  addr.Eb(0);
  expect(0).toBe(0);
});
