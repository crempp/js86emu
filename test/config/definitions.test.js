import Definitions from '../../src/jsemu/config/Definitions'
import Systems from '../../src/jsemu/config/definitions/systems'
import ProgramFragments from '../../src/jsemu/config/definitions/programfragments'
import CPUs from '../../src/jsemu/config/definitions/cpus'
import Games from '../../src/jsemu/config/definitions/games'
import BIOSs from '../../src/jsemu/config/definitions/bios'
import Harddisks from '../../src/jsemu/config/definitions/harddisks'
import Floppies from '../../src/jsemu/config/definitions/floppies'
import Graphics from '../../src/jsemu/config/definitions/graphics'
import Inputs from '../../src/jsemu/config/definitions/inputs'

describe('Definitions class', () => {
  test('instantiates', () => {
    expect(new Definitions()).toBeInstanceOf(Definitions);
  });

  test('has attributes', () => {
    let d = new Definitions();
    expect(d.systems).toBeInstanceOf(Object);
    expect(d.program_fragments).toBeInstanceOf(Object);
    expect(d.cpus).toBeInstanceOf(Object);
    expect(d.games).toBeInstanceOf(Object);
    expect(d.bios).toBeInstanceOf(Object);
    expect(d.harddisks).toBeInstanceOf(Object);
    expect(d.floppies).toBeInstanceOf(Object);
    expect(d.graphics).toBeInstanceOf(Object);
  });

  test('CPUs in system defs must exist in CPU defs', () => {
    for (let system in Systems) {
      let c = Systems[system]['configuration']['cpu'];
      if (c !== null) {
        expect(CPUs[c]).toBeInstanceOf(Object);
      }
    }
  });

  test('system BIOSs in system defs must exist in BIOS defs', () => {
    for (let system in Systems) {
      let sb = Systems[system]['configuration']['systembios'];
      if (sb !== null) {
        expect(BIOSs[sb]).toBeInstanceOf(Object);
      }
    }
  });

  test('harddisks in system defs must exist in Harddisk defs', () => {
    for (let system in Systems) {
      let hd = Systems[system]['configuration']['harddisk'];
      if (hd !== null) {
        expect(Harddisks[hd]).toBeInstanceOf(Object);
      }
    }
  });

  test('floppies in system defs must exist in Floppies defs', () => {
    for (let system in Systems) {
      let fd = Systems[system]['configuration']['floppy'];
      if (fd !== null) {
        expect(Floppies[fd]).toBeInstanceOf(Object);
      }
    }
  });

  test('graphics in system defs must exist in Graphics defs', () => {
    for (let system in Systems) {
      let gfx = Systems[system]['configuration']['floppy'];
      if (gfx !== null) {
        expect(Graphics[gfx]).toBeInstanceOf(Object);
      }
    }
  });

  test('graphics BIOS in system defs must exist in BIOS defs', () => {
    for (let system in Systems) {
      let gb = Systems[system]['configuration']['gfxbios'];
      if (gb !== null) {
        expect(BIOSs[gb]).toBeInstanceOf(Object);
      }
    }
  });

  test('inputs in system defs must exist in Input defs', () => {
    for (let system in Systems) {
      let i = Systems[system]['configuration']['input'];
      if (i !== null) {
        expect(Inputs[i]).toBeInstanceOf(Object);
      }
    }
  });

  test('system references in game defs exist', () => {
    for (let system in Games) {
      expect(Systems[system]).toBeInstanceOf(Object);
    }
  });

  test('system BIOS lookup', () => {
    let d = new Definitions();
    expect(d.systemBios('ibmpcjr')).toMatchObject(
      { name: '8086 Tiny BIOS',
        image: '',
        description: '',
        morelink: 'https://github.com/adriancable/8086tiny',
        type: 'system',
        file: 'bios-roms/8086tiny_bios'
      }
    )
  });



  //test('expand assembles definition hierarchy', () => {
  //  let d = new Definitions();
  //  d.expand();
  //});
});