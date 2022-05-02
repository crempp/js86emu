import {NS_PER_SEC} from "./Constants";

export default class Clock {
  constructor(system) {
    this.config = system.config;
    this.timers = new Map();

    this.system = system;
    this.cycles = 0;
    this.prevTimeNS = 0; // nanoseconds
    this.hz = 0;
    this.cyclePeriodNS = 0; // nanoseconds
    this.videoSyncCycles = this.config.video.defaultCycleSync;
    // TODO: Make this configurable
    this.timerCheckCycles = 10;
  }

  tick() {
    // update cycle count
    this.cycles++;

    // Every timeSyncCycles sync things
    if (this.cycles % this.config.timeSyncCycles === 0) {
      this.sync();
    }

    if (this.cycles % this.timerCheckCycles === 0) {
      this.checkTimers();
    }
  }

  sync() {
    let nowNS = Math.trunc(performance.now() * 1e6);
    let diff = nowNS - this.prevTimeNS;
    this.prevTimeNS = nowNS;

    // Update cycle time
    this.cyclePeriodNS = ((diff / this.cycles));

    // update frequency
    this.hz = 1 / (this.cyclePeriodNS / 1e9);

    // Update the number of cycles between video syncs
    this.videoSyncCycles = Math.min(
        Math.round(this.hz / this.config.video.verticalSync),
        this.config.video.defaultCycleSync);
  }

  /**
   * Add a timer to the clock. The provided function will be run when the clock
   * gets to the provided triggerTime.
   *
   * NOTE: Uses performance.now() so times will be represented as high resolution
   * milliseconds. For example 34567.45345567ms. Also worth noting is that
   * performance.now() counts the time since the session started.
   *
   * @param {number} triggerTimeNS Time to run the timer function (ns)
   * @param {function} fn Function to run when timer triggers
   */
  addTimer(triggerTimeNS, fn) {
    // Use nano second time as the key
    triggerTimeNS = Math.trunc(triggerTimeNS);
    this.timers.set(triggerTimeNS, {
      fn: fn,
      triggerTime: triggerTimeNS,
    });
    return triggerTimeNS;
  }

  removeTimer(timerID) {
    if (this.timers.has(timerID)) {
      this.timers.delete(timerID);
    }
  }

  checkTimers() {
    // TODO: Log now - triggerTime to Debug (array) so we can watch and see problems
    let nowNS = Math.trunc(performance.now() * 1e6);
    for (let [id, timer] of this.timers) {
      let halfWayToNextTime = nowNS + ((this.timerCheckCycles * this.cyclePeriodNS) / 2);
      if (nowNS > timer.triggerTime || timer.triggerTime < halfWayToNextTime) {
        timer.fn();
      }
    }
  }
}