import fs from "fs";
import path from 'path';
import each from 'jest-each';
import CPU8086 from '../../src/emu/cpu/8086';
import SystemConfig from '../../src/emu/config/SystemConfig';
import {regCS, regIP, regSP, STATE_RUNNING} from "../../src/emu/Constants";

describe('Code Golf', () => {
  let cpu, codeData;
  let cycles = [];
  for (let i = 0; i < 50; i++) { cycles.push([i]); }

  beforeAll( () => {
    const codeFile = path.join(__dirname, "../../public/files/program-blobs", "codegolf");
    codeData = fs.readFileSync(codeFile);

    let config = new SystemConfig({
      memorySize: 2**16,
      debug: false,
    });

    cpu = new CPU8086(config);
    cpu.reg16[regIP] = 0;
    cpu.reg16[regSP] = 0x100;
    cpu.reg16[regCS] = 0x0000;
    cpu.state = STATE_RUNNING;

    for (let i = 0; i < codeData.length; i++) {
      cpu.mem8[i] = codeData[i];
    }
  });

  each(cycles).test('cycle %s', () => {
    cpu.cycle();
    expect(cpu.getState()).toMatchSnapshot();
  });
});
