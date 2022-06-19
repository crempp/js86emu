export default class Speaker  {
  constructor(config, system) {
    this.config = config;
    this.system = system;
    this.debug = system.debug;
  }

  timerHandler(value) {
    this.debug.info(`Speaker:timerHandler(${value})`);
  }

  boot() {
    this.system.io.devices["PIT8253"].registerChannelLister(2, this.timerHandler.bind(this));
  }
}
