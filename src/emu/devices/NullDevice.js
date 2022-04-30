import Device from "./Device";

export default class NullDevice extends Device{
  constructor (config, system) {
    super(config, system);
  }

  boot() {}

  write(port, value, size) {}

  read(port, size) {}

  deviceCycle() {}
}
