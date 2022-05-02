// noinspection FallThroughInSwitchStatementJS

import Device from "./Device";
import {FeatureNotImplementedException} from "../utils/Exceptions";
import {LSB, MSB} from "../Constants";


const RL_LATCH    = 0;
const RL_LSB_ONLY = 1;
const RL_MSB_ONLY = 2;
const RL_LSB_MSB  = 3;

/**
 *
 * ============================================================================
 * Control Word Format
 * ============================================================================
 *
 *   D7     D6    D5    D4    D3    D2    D1    D0
 * +-----------------------------------------------+
 * | SC1 | SC0 | RL1 | RL0 |  M2 |  M1 |  M0 | BCD |
 * +-----------------------------------------------+
 *
 *     Select Counter
 *
 *     SC1 SC2
 *     --- ---    ----------------
 *      0   0  |  Select Counter 0
 *      0   1  |  Select Counter 1
 *      1   0  |  Select Counter 2
 *      1   1  |  Illegal
 *
 *     Read/Load
 *
 *     RL1 RL0
 *     --- ---    --------------------------------------
 *      0   0  |  Counter latching operation
 *      1   0  |  Read/Load most significant byte only
 *      0   1  |  Read/Load least significant byte only
 *      1   1  |  Read/Load least significant byte first
 *             |  then most significant byte
 *     Mode
 *
 *      M2  M1  M2
 *     --- --- ---    ----------------
 *      0   0   0  |  Mode 0
 *      0   0   1  |  Mode 1
 *      X   1   0  |  Mode 2
 *      X   1   1  |  Mode 3
 *      1   0   0  |  Mode 4
 *      1   0   1  |  Mode 5
 *
 *
 *     BCD
 *     ---    ----------------------------------------------
 *      0  |  Binary Counter 16-bits
 *      1  |  Binary coded decimal (BCD) counter (4 decades)
 *
 *
 */
export default class PIT8253 extends Device {
  constructor(config, system) {
    super(config, system);

    this.timerFreq   = 1193181.6666 // Timer runs at 1.193182 MHZ
    this.timerPeriodNS = Math.trunc(1e9 / this.timerFreq);

    this.currentByte = LSB;
    this.channels = [
      {
        readLoad:  RL_LATCH,
        mode:      0,
        bcd:       0,
        counter:   0,
        resetVal:  0,
        setTimeNS: 0,
        gate:      0,
        outputFn: (output) => {},
        timerID:   null,
        latchRegister: null,
      },
      {
        readLoad: RL_LATCH,
        mode:     0,
        bcd:      0,
        counter:  0,
        resetVal: 0,
        setTimeNS:  0,
        gate:     0,
        outputFn: (output) => {},
        timerID:  null,
        latchRegister: null,
      },
      {
        readLoad: RL_LATCH,
        mode:     0,
        bcd:      0,
        counter:  0,
        resetVal: 0,
        setTimeNS:  0,
        gate:     0,
        outputFn: (output) => {},
        timerID:  null,
        latchRegister: null,
      },
    ]
  }

  boot() {}

  write(port, value, size) {
    let channel;
    switch (port) {
      case 0x40: // Channel 0, counter divisor
      case 0x41: // Channel 1, RAM refresh counter, we don't care about this
      case 0x42: // Channel 2, Cassette and speaker functions
        channel = port - 0x40;
        let rlMode = this.channels[channel].readLoad;

        // Set the appropriate byte
        if (this.currentByte === MSB) {
          this.channels[channel].resetVal = (this.channels[channel].resetVal & 0x00FF) | (value << 8);
        } else { // LSB only or LSB first
          this.channels[channel].resetVal = (this.channels[channel].resetVal & 0xFF00) | (value & 0xFF);
        }

        // If we're done loading values adjust the zero value (can't divide a frequency by zero)
        // Do this before updating the currentByte
        if (this.channels[channel].resetVal === 0 && (rlMode === RL_MSB_ONLY || rlMode === RL_LSB_ONLY || (rlMode === RL_LSB_MSB && this.currentByte === MSB))) {
          if (this.channels[channel].bcd === 0) this.channels[channel].resetVal = 65536;
          else if (this.channels[channel].bcd === 1) this.channels[channel].resetVal = 10000;
        }

        // If the mode is set to read/load LSB then MSB update the current byte
        if (rlMode === RL_LSB_MSB) {
          this.currentByte = this.currentByte + 1 % 2;
        }

        // Set the time for use in simulating the countdown
        this.channels[channel].setTimeNS = Math.trunc(performance.now() * 1e6);

        // Start timers
        // If we're set for RL_LSB_MSB make sure we only start the timer when MSB is set
        if (this.channels[channel].readLoad !== RL_LSB_MSB || this.currentByte === MSB) {
          switch (this.channels[channel].mode) {
            case 0:
              throw new FeatureNotImplementedException("Mode 0 timers not implemented");
            case 1:
              throw new FeatureNotImplementedException("Mode 1 timers not implemented");
            case 2:
              this.restartTimer(channel);
              break;
            case 3:
              throw new FeatureNotImplementedException("Mode 3 timers not implemented");
            case 4:
              throw new FeatureNotImplementedException("Mode 4 timers not implemented");
            case 5:
              throw new FeatureNotImplementedException("Mode 5 timers not implemented");
            }
        }
        break;
      case 0x43:
        // Mode control
        channel = (value >> 6) & 0x3

        // Latch commands only set the latch and do nothing else
        let readLoad = (value >> 4) & 0x3;
        if (readLoad === 0) {
          this.channels[channel].latchRegister = this.getCount(channel);
        }
        else {
          this.channels[channel].readLoad = readLoad;
          this.channels[channel].mode     = (value >> 1) & 0x7;
          this.channels[channel].bcd      = value & 0x1;

          // Prepare for the correct byte to be accessed
          if (this.channels[channel].readLoad === RL_MSB_ONLY) {
            this.currentByte = MSB;
          }
          else {
            this.currentByte = LSB;
          }

          // Reset the latch
          this.channels[channel].latchRegister = null;

          switch (this.channels[channel].mode) {
            case 0:
              throw new FeatureNotImplementedException("Mode 1 timers not implemented");
            case 1:
              throw new FeatureNotImplementedException("Mode 1 timers not implemented");
            case 2:
              // output goes high
              break;
            case 3:
              throw new FeatureNotImplementedException("Mode 3 timers not implemented");
            case 4:
              throw new FeatureNotImplementedException("Mode 4 timers not implemented");
            case 5:
              throw new FeatureNotImplementedException("Mode 5 timers not implemented");
          }
        }
        break;
      case 0x44:
        // PS/2 extended timer
        throw new FeatureNotImplementedException("Port 0x44, PS/2 extended timer not implemented");
      case 0x47:
        // Channel 3 control byte
        throw new FeatureNotImplementedException("Port 0x47, Channel 3 control byte not implemented");
    }
  }

  read(port, size) {
    let channel;
    let workingValue = 0;
    let returnValue = 0;
    let value = 0;
    switch (port) {
      case 0x40: // Channel 0, counter divisor
      case 0x41: // Channel 1, RAM refresh counter, we don't care about this
      case 0x42: // Channel 2, Cassette and speaker functions
        channel = port - 0x40;

        // If the latch is set use that value and reset the latch
        if (this.channels[channel].latchRegister !== null) {
          workingValue = this.channels[channel].latchRegister;
          this.channels[channel].latchRegister = null;
        }
        else {
          workingValue = this.getCount(channel);
        }

        // Next, isolate the correct byte to return
        if (this.currentByte === MSB) {
          returnValue = workingValue >> 8;
        }
        else { // LSB only or LSB first
          returnValue = workingValue & 0xFF;
        }

        // Finally, update the current byte if the mode is set to "LSB then MSB"
        if (this.channels[channel].readLoad === RL_LSB_MSB) {
          this.currentByte = this.currentByte + 1 % 2;
        }

        return returnValue;
      case 0x43:
        // Mode control
        break;
      case 0x44:
        // PS/2 extended timer
        throw new FeatureNotImplementedException("Port 0x44, PS/2 extended timer not implemented");
      case 0x47:
        // Channel 3 control byte
        throw new FeatureNotImplementedException("Port 0x47, Channel 3 control byte not implemented");
    }
  }

  deviceCycle() {
  }

  setGate(channel, value) {
    this.channels[channel].gate = value;
  }

  getCount(channel, wrap=true) {
    let nowNS = Math.trunc(performance.now() * 1e6);
    let baseCount = Math.trunc((nowNS - this.channels[channel].setTimeNS) / this.timerPeriodNS);

    // Always update channel count
    if (wrap) {
      // Wrap the count around. We could have passed the count value multiple
      // times so we need to use the formula
      //     (x % m + m) % m
      // See this thread https://stackoverflow.com/a/16964329/1436323
      let m = this.channels[channel].resetVal;
      this.channels[channel].counter = (((this.channels[channel].resetVal - baseCount) % m) + m) % m;
    }
    else {
      this.channels[channel].counter = Math.max(this.channels[channel].resetVal - baseCount, 0);
    }

    return this.channels[channel].counter;
  }

  restartTimer(channel) {
    // Remove the current timer from the clock
    if (this.channels[channel].timerID !== null) {
      this.system.clock.removeTimer(this.channels[channel].timerID);
    }

    // Add a new timer to the clock
    let nowNS = Math.trunc(performance.now() * 1e6);
    let nsFromNow = this.timerPeriodNS * this.channels[channel].resetVal;
    this.channels[channel].timerID = this.system.clock.addTimer(
        nowNS + nsFromNow,
        () => this.handleChannelCount0(channel));
  }

  handleChannelCount0(channel) {
    switch (this.channels[channel].mode) {
      case 0:
        // Output goes high and stays high. Counter wraps and continues
        this.restartTimer(channel);
        // Channel 0 fires interupt 0 when counter reaches 0
        if (channel === 0) {
          // TODO: fire interrupt
        }
        break;
      case 1:
        throw new FeatureNotImplementedException("Mode 1 timers not implemented");
      case 2:
        // output goes high, call output fn
        this.channels[channel].outputFn(1);
        // then output goes low
        this.channels[channel].outputFn(0);
        // Update the count, this won't be exactly zero since our timers are
        // inaccurate. If we are past zero the count will wrap.
        this.channels[channel].counter = this.getCount(channel);
        // restart count
        this.restartTimer(channel);
        break;
      case 3:
        throw new FeatureNotImplementedException("Mode 3 timers not implemented");
      case 4:
        throw new FeatureNotImplementedException("Mode 4 timers not implemented");
      case 5:
        throw new FeatureNotImplementedException("Mode 5 timers not implemented");
    }
  }

}