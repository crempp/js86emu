import {SystemConfigException} from "../../src/emu/utils/Exceptions";
import System from "../../src/emu/System";
import SystemConfig from "../../src/emu/config/SystemConfig";
import path from "path";

const FILE_PATH_BASE = path.normalize(`${__dirname}../../../public/`);

describe('basic system functionality', () => {
  let system;

  beforeEach(() => {
    // Make console logs be quiet.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    system = new System(new SystemConfig({
      memorySize: 1048576,
      renderer: {
        class: 'RendererNoop',
      },
      bios: {
        path: `${FILE_PATH_BASE}files/bios-roms/`,
        file: "BIOS_IBM5150_24APR81_5700051_U33.BIN",
      },
      video: {
        memorySize:   4 * 1024,
        memoryStart:  0xB8000,
        verticalSync: 50,       // Hertz
        fontPath: `${FILE_PATH_BASE}files/fonts/`
      },
      debug: false,
    }));
  })

  test('system instantiates', () => {
    expect(system).toBeInstanceOf(System);
  });

  test('undefined config throws', () => {
    expect(() => {
      let s = new System();
    }).toThrowError(SystemConfigException);
  });

  test('system boots', async () => {
    await system.boot();

    expect(system).toBeInstanceOf(System);
    expect(system.cycleCount).toBe(0);
    // The last byte of the IBM BIOS is EB
    expect(system.cpu.mem8[system.cpu.mem8.length - 1]).toBe(0xEB);
    expect(system.videoCard.font.length).toBeGreaterThan(0);
  });

  test('system runs', async () => {
    await system.boot();
    system.run(10);

    expect(system.cycleCount).toBe(10);
  })

  test('system can load memory', () => {
    system.loadMem(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), 0x10);

    expect(Array.from(system.cpu.mem8.slice(0x10, 0x18))).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  })
});
