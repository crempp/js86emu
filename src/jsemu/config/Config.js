import Settings from './Settings'
import Systems from './definitions/systems'
import Components from './definitions/components'
import ProgramFragments from './definitions/programfragments'

export default class Config {
  constructor() {
    this.settings = new Settings();
    this.systems = Systems;
    this.components = Components;
    this.program_fragments = ProgramFragments;
  }
}