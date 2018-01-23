import Systems from './definitions/systems'
import ProgramFragments from './definitions/programfragments'
import CPUs from './definitions/cpus'
import Games from './definitions/games'
import BIOSs from './definitions/bios'
import Harddisks from './definitions/harddisks'
import Floppies from './definitions/floppies'
import Graphics from './definitions/graphics'
import Inputs from './definitions/inputs'

/**
 * Component Definitions
 *
 * This class provides access to static definitions of
 *   * Fully configured systems such as the IBM 5150
 *   * CPUs
 *   * BIOSs
 *   * Games
 *   * etc...
 */
export default class Definitions {

  constructor() {
    /**
     * System Definitions
     *
     * <pre><code>
     *   [
     *     {
     *       "name": "IBM PCJR",
     *       "image": "../../assets/images/tmp_assets/ibm_pcjr.png",
     *       "description": "Like a baby PC",
     *       "morelink": "https://en.wikipedia.org/wiki/IBM_PCjr",
     *       "configuration": {
     *         "cpu": "cpu-8086",
     *         "systembios": "bios-8086tiny",
     *         "harddisk": null,
     *         "floppy": null,
     *         "gfx": "gfx-cga",
     *         "gfxbios": "bios-asciicga",
     *         "input": null
     *       },
     *       ...
     *     ]
     *   }
     * </code></pre>
     */
    this.systems = Systems;

    /**
     * CPU Definitions
     *
     * <pre><code>
     * {
        "name": "8086/8088",
        "image": "",
        "description": "The 8086 (\"eighty-eighty-six\", also called iAPX 86) is a 16-bit microprocessor chip designed by Intel between early 1976 and mid-1978, when it was released. The Intel 8088, released in 1979, was a slightly modified chip with an external 8-bit data bus (allowing the use of cheaper and fewer supporting ICs[note 1]), and is notable as the processor used in the original IBM PC design, including the widespread version called IBM PC XT.",
        "morelink": "http://en.wikipedia.org/wiki/Intel_8086",
        "module": "emu/cpu/8086"
      }
     * @type {Object}
     */
    this.cpus = CPUs;

    /**
     * BIOS Definitions
     * @type {Object}
     */
    this.bios = BIOSs;

    /**
     * Harddisk Definitions
     * @type {Object}
     */
    this.harddisks = Harddisks;

    /**
     * Floppy Definitions
     * @type {Object}
     */
    this.floppies = Floppies;

    /**
     * Graphics Definitions
     * @type {Object}
     */
    this.graphics = Graphics;

    /**
     * Game Definitions
     * @type {Object}
     */
    this.games = Games;

    /**
     * Program Fragment Definitions
     * @type {Object}
     */
    this.program_fragments = ProgramFragments;
  }

  /**
   * Get system definition for give system ID.
   *
   * See {@link Definitions#system} for Object structure.
   *
   * @param {string} systemID ID of system to return
   * @returns {Object} System object
   */
  system(systemID) {
    let system = this.systems[systemID];
    return system
  }

  /**
   * Lookup BIOS definition object for given system ID
   *
   * See {@link Definitions#bios} for Object structure.
   *
   * @param {string} systemID System ID
   * @returns {Object} BIOS definition object
   */
  systemBios(systemID) {
    let bios = this.bios[this.systems[systemID]['configuration']['systembios']];
    if (bios['type'] !== 'system') {
      throw 'System has non-system BIOS defined for system BIOS'
    }
    return bios
  }

  systemCPU
  systemHardDisk

}