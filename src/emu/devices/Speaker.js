export default class Speaker  {
  constructor(config, system) {
    this.config = config;
    this.system = system;
    this.debug = system.debug;
    this.muted = false;

    // create web audio api context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.squareOscilator = null;
  }

  timerHandler(value) {
    this.debug.info(`  Speaker:timerHandler(${value})`);
    let timer = this.system.io.devices["PIT8253"].channels[2];
    if (timer.running) {
      if (value === 1) {
        let timerFreq = this.system.io.devices["PIT8253"].timerFreq;
        let count = timer.resetVal;
        let freq = timerFreq/count;
        this.start(freq);
      }
      else if (value === 0) {
        this.stop();
      }
    }
  }

  start(freq) {
    if (!this.muted) {
      this.squareOscilator = this.audioCtx.createOscillator();
      this.squareOscilator.type = "square";
      this.squareOscilator.frequency.setValueAtTime(freq, this.audioCtx.currentTime); // value in hertz
      this.squareOscilator.connect(this.audioCtx.destination);
      this.squareOscilator.start();
    }
  }

  stop() {
    if (this.squareOscilator) {
      this.squareOscilator.stop(this.audioCtx.currentTime);
    }
    else {
      this.debug.error("SPEAKER: Tried to stop oscilator that wasn't running");
    }
  }

  boot() {
    if ("PIT8253" in this.system.io.devices) {
      this.system.io.devices["PIT8253"].registerChannelLister(2, this.timerHandler.bind(this));
    }
  }
}
