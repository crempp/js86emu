import Definitions from '../config/Definitions'
import Settings from '../config/Settings'

export default class System {
  constructor(systemId) {
    // If systemId is null custom system???

    if (!systemId) {
      throw "System needs an ID"
    }

    this.settings = new Settings();
    this.definitions = new Definitions();

    let system = this.definitions.systems[systemId];

    //console.log(system);

    //this.cpu = system.configuration.cpu;
    //this.systembios = system.configuration.systembios;
    //this.harddisk = system.configuration.harddisk;
    //this.floppy = system.configuration.floppy;
    //this.gfx = system.configuration.gfx;
    //this.gfxbios = system.configuration.gfxbios;
    //this.input = system.configuration.input;
  }
}