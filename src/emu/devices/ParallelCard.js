import Device from "./Device";
import Card from "./Card";

export default class ParallelCard extends Card{
  constructor (config, system) {
    super(config, system);
  }

  boot() {
    console.log(`  BOOT device: ${this.constructor.name}`);
  }

  write(port, value, size) {
    // 3BC Parallel Data Port
    // 3BD Printer Status Port
    // 3BE Printer Control Port
    // 3BF Not Used
  }

  read(port, size){}

  deviceCycle(){
    if (this.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }
}
