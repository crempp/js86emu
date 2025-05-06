import Card from "./Card";

export default class ParallelCard extends Card{
  constructor (config, system) {
    super(config, system);
  }

  boot() {}

  write(port, value, size) {
    // 3BC Parallel Data Port
    // 3BD Printer Status Port
    // 3BE Printer Control Port
    // 3BF Not Used
  }

  read(port, size){}

  deviceCycle(){}
}
