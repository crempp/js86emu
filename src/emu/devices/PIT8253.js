// noinspection FallThroughInSwitchStatementJS
/**
 * The Intel 8253 is a programmable interval timers (PITs), which performs
 * timing and counting functions using three 16-bit counters.
 *
 * ============================================================================
 * Control Word Format
 * ============================================================================
 *
 *       D7     D6    D5    D4    D3    D2    D1    D0
 *     +-----------------------------------------------+
 *     | SC1 | SC0 | RL1 | RL0 |  M2 |  M1 |  M0 | BCD |
 *     +-----------------------------------------------+
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
 * ============================================================================
 * Mode 0: Interrupt on Terminal Count
 * ============================================================================
 *   Mode 0 is used for the generation of accurate time delay under
 *   software control. In this mode, the counter will start
 *   counting from the initial COUNT value loaded into it, down to
 *   0. Counting rate is equal to the input clock frequency.
 *
 *   The OUT pin is set low after the Control Word is written, and
 *   counting starts one clock cycle after the COUNT is programmed.
 *   OUT remains low until the counter reaches 0, at which point
 *   OUT will be set high until the counter is reloaded or the
 *   Control Word is written. The counter wraps around to 0xFFFF
 *   internally and continues counting, but the OUT pin never
 *   changes again. The Gate signal should remain active high for
 *   normal counting. If Gate goes low, counting is suspended, and
 *   resumes when it goes high again.
 *
 *   The first byte of the new count when loaded in the count register, stops
 *   the previous count.
 *
 * ============================================================================
 * Mode 1 - Programmable One Shot
 * ============================================================================
 *   In this mode 8253 can be used as a Monostable multivibrator. GATE input is
 *   used as trigger input.
 *
 *   OUT will be initially high. OUT will go low on the Clock pulse following a
 *   trigger to begin the one-shot pulse, and will remain low until the Counter
 *   reaches zero. OUT will then go high and remain high until the CLK pulse
 *   after the next trigger.
 *
 *   After writing the Control Word and initial count, the Counter is armed.
 *   A trigger results in loading the Counter and setting OUT low on the next
 *   CLK pulse, thus starting the one-shot pulse. An initial count of N will
 *   result in a one-shot pulse N CLK cycles in duration.
 *
 *   The one-shot is retriggerable, hence OUT will remain low for N CLK pulses
 *   after any trigger. The one-shot pulse can be repeated without rewriting
 *   the same count into the counter. GATE has no effect on OUT. If a new count
 *   is written to the Counter during a oneshot pulse, the current one-shot
 *   is not affected unless the counter is retriggered. In that case, the
 *   Counter is loaded with the new count and the oneshot pulse continues
 *   until the new count expires.
 *
 * ============================================================================
 * Mode 2 - Rate Generator
 * ============================================================================
 *   In this mode, the device acts as a divide-by-n counter, which
 *   is commonly used to generate a real-time clock interrupt. Like
 *   other modes, the counting process will start the next clock
 *   cycle after COUNT is sent. OUT will then remain high until the
 *   counter reaches 1, and will go low for one clock pulse. The
 *   following cycle, the count is reloaded, OUT goes high again,
 *   and the whole process repeats itself.
 *
 *   The time between the high pulses depends on the preset count
 *   in the counter's register, and is calculated using the
 *   following formula:
 *      Value to be loaded into counter = f_input / f_output
 *
 *   Note that the values in the COUNT register range from n to 1;
 *   the register never reaches zero.
 *
 * ============================================================================
 * Mode 3 - Square Wave Generator
 * ============================================================================
 *   This mode is similar to mode 2. However, the duration of the high and low
 *   clock pulses of the output will be different from mode 2.
 *
 *   Suppose n is the number loaded into the counter (the COUNT message), the
 *   output will be high for ceil(n/2) counts, and low for floor(n/2) counts.
 *   Thus, the period will be n counts, and if n is odd, the extra half-cycle
 *   is spent with OUT high.
 *
 * ============================================================================
 * Mode 4 - Software Triggered Strobe
 * ============================================================================
 * After Control Word and COUNT is loaded, the output will remain high until
 * the counter reaches zero. The counter will then generate a low pulse for 1
 * clock cycle (a strobe) – after that the output will become high again.
 *
 * GATE low suspends the count, which resumes when GATE goes high again.
 *
 * ============================================================================
 * Mode 5 - Hardware Triggered Strobe
 * ============================================================================
 * This mode is similar to mode 4. However, the counting process is triggered
 * by the GATE input.
 *
 * After receiving the Control Word and COUNT, the output will be set high.
 * Once the device detects a rising edge on the GATE input, it will start
 * counting. When the counter reaches 0, the output will go low for one clock
 * cycle – after that it will become high again, to repeat the cycle on the
 * next rising edge of GATE.
 */
import Device from "./Device";
import {FeatureNotImplementedException, PortAccessException} from "../utils/Exceptions";
import {LSB, MSB, PIN_HIGH, PIN_LOW} from "../Constants";

const RL_LATCH    = 0;
const RL_LSB_ONLY = 1;
const RL_MSB_ONLY = 2;
const RL_LSB_MSB  = 3;

export default class PIT8253 extends Device {
  constructor(config, system) {
    super(config, system);

    this.timerFreq = 1193181.6666 // Timer runs at 1.193182 MHZ
    this.timerPeriodNS = Math.trunc(1e9 / this.timerFreq);

    this.currentByte = LSB;
    this.channels = [
      {
        readLoad:  RL_LATCH,
        mode:          0,
        bcd:           0,
        counter:       0,
        resetVal:      0,
        setTimeNS:     0,
        gate:          0,
        out:           null,
        outputFn:      () => {},
        timerID:       null,
        squareWaveTimerId: null,
        latchRegister: null,
        running:       false,
      },
      {
        readLoad: RL_LATCH,
        mode:          0,
        bcd:           0,
        counter:       0,
        resetVal:      0,
        setTimeNS:     0,
        gate:          0,
        out:           null,
        outputFn:      () => {},
        timerID:       null,
        squareWaveTimerId: null,
        latchRegister: null,
        running:       false,
      },
      {
        readLoad: RL_LATCH,
        mode:          0,
        bcd:           0,
        counter:       0,
        resetVal:      0,
        setTimeNS:     0,
        gate:          0,
        out:           null,
        outputFn:      () => {},
        timerID:       null,
        squareWaveTimerId: null,
        latchRegister: null,
        running:       false,
      },
    ]
  }

  /**
   * Write a value to a port.
   *
   * @param port {number} Port to write the value to
   * @param value {number} Value to write to the port
   * @param size {number} Size of the write operation
   */
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
          if (this.channels[channel].mode === 0){
            this.stopTimer(channel);
          }
          this.channels[channel].resetVal = (this.channels[channel].resetVal & 0xFF00) | (value & 0xFF);
        }

        // If we're done loading values adjust the zero value (can't divide a frequency by zero)
        // Do this before updating the currentByte
        if (this.channels[channel].resetVal === 0 &&
            (rlMode === RL_MSB_ONLY || rlMode === RL_LSB_ONLY || (rlMode === RL_LSB_MSB && this.currentByte === MSB))) {
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
            case 0: // Mode 0 - Interrupt on Terminal Count
              this.restartTimer(channel);
              break;
            case 1: // Mode 1 - Programmable One Shot
              // Do nothing her for mode 1, timer is started by the gate
              break;
            case 2: // Mode 2 - Rate Generator
              // We don't use the rate timer because the rate is calculated
              // by the user and we just need to count the programmed value
              this.restartTimer(channel);
              break;
            case 3: // Mode 3 - Square Wave Generator
              this.restartTimer(channel);
              this.restartSquareWaveTimer(channel, Math.ceil(this.channels[channel].resetVal));
              break;
            case 4: // Mode 4 - Software Triggered Strobe
              this.restartTimer(channel);
              break;
            case 5: // Mode 5 - Hardware Triggered Strobe
              // Do nothing her for mode 5, timer is started by the gate
            }
        }
        break;
      case 0x43: // Mode control
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

          // Update output pin depending on mode
          switch (this.channels[channel].mode) {
            case 0: // Mode 0 - Interrupt on Terminal Count
              this.channels[channel].out = PIN_LOW;
              this.channels[channel].outputFn(PIN_LOW);
              break;
            case 1: // Mode 1 - Programmable One Shot
              this.channels[channel].out = PIN_HIGH;
              this.channels[channel].outputFn(PIN_HIGH);
              break;
            case 2: // Mode 2 - Rate Generator
              this.channels[channel].out = PIN_HIGH;
              this.channels[channel].outputFn(PIN_HIGH);
              break;
            case 3: // Mode 3 - Square Wave Generator
              this.channels[channel].out = PIN_HIGH;
              this.channels[channel].outputFn(PIN_HIGH);
              break;
            case 4: // Mode 4 - Software Triggered Strobe
              this.channels[channel].out = PIN_HIGH;
              this.channels[channel].outputFn(PIN_HIGH);
              break;
            case 5: // Mode 5 - Hardware Triggered Strobe
              this.channels[channel].out = PIN_HIGH;
              this.channels[channel].outputFn(PIN_HIGH);
              break;
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

  /**
   * Read from the device port
   *
   * @param port {number} Port number to read from
   * @param size {number} Size of the read operation
   * @returns {number|undefined}
   */
  read(port, size) {
    let channel;
    let workingValue = 0;
    let returnValue = 0;
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
      case 0x43: // Mode control
        throw new PortAccessException("Port 0x43 (PIT Mode Control) is not readable");
      case 0x44: // PS/2 extended timer
        throw new FeatureNotImplementedException("Port 0x44, PS/2 extended timer not implemented");
      case 0x47: // Channel 3 control byte
        throw new FeatureNotImplementedException("Port 0x47, Channel 3 control byte not implemented");
    }
  }

  /**
   * Set a channel's gate. The gate is used for different purposes depending on
   * the channel.
   *
   * @param channel {number} Channel of the gate to set
   * @param value {number} Value to set gate to
   */
  setGate(channel, value) {
    this.channels[channel].gate = value;

    switch (this.channels[channel].mode) {
      case 0: // Mode 0 - Interrupt on Terminal Count
        if (value === PIN_LOW) {
          // Ensure count is updated
          this.getCount(channel);
          // Stop timer
          this.stopTimer(channel);
        }
        else {
          // Restart timer from where it left off
          this.restartTimer(channel, true);
        }
        break;
      case 1: // Mode 1 - Programmable One Shot
        if (value === PIN_HIGH) {
          this.restartTimer(channel);
          this.channels[channel].out = PIN_LOW;
          this.channels[channel].outputFn(PIN_LOW);
        }
        break;
      case 2: // Mode 2 - Rate Generator
        if (value === PIN_LOW) {
          this.channels[channel].out = PIN_LOW;
          this.channels[channel].outputFn(PIN_LOW);
          this.restartTimer(channel);
        }
        break;
      case 3:  // Mode 3 - Square Wave Generator
        if (value === PIN_LOW) {
          this.stopTimer(channel);
          this.channels[channel].out = PIN_LOW;
          this.channels[channel].outputFn(PIN_LOW);
        }
        else {
          this.restartTimer(channel);
          this.channels[channel].out = PIN_HIGH;
          this.channels[channel].outputFn(PIN_HIGH);
        }
        break;
      case 4: // Mode 4 - Software Triggered Strobe
        if (value === PIN_LOW) {
          // Ensure count is updated
          this.getCount(channel);
          // Stop timer
          this.stopTimer(channel);
        }
        else {
          // Restart timer from where it left off
          this.restartTimer(channel, true);
        }
        break;
      case 5: // Mode 5 - Hardware Triggered Strobe
        if (value === PIN_HIGH) {
          this.restartTimer(channel);
          this.channels[channel].out = PIN_LOW;
          this.channels[channel].outputFn(PIN_LOW);
        }
        break;
    }
  }

  /**
   * Retrieve the count from a channel and update the PIT's stored count value.
   *
   * @param channel {number} Channel to retrieve count from
   * @param wrap {boolean} Wrap overflowed counts
   * @returns {number}
   */
  getCount(channel, wrap=true) {
    let nowNS = Math.trunc(performance.now() * 1e6);
    let baseCount = Math.trunc((nowNS - this.channels[channel].setTimeNS) / this.timerPeriodNS);

    if (wrap) {
      // We could have passed the count value multiple times, so we need to
      // use the formula
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

  /**
   * Restart the channel's timer. If fromCount is true the counter will pick
   * up from the stored count value, otherwise it will start from the
   * originally loaded count value.
   *
   * @param channel {number} Channel to restart timer on
   * @param fromCount {boolean} Should the counter start from where it left off?
   */
  restartTimer(channel, fromCount=false) {
    // Remove the current timer from the clock
    this.stopTimer(channel);

    // Add a new timer to the clock
    let nowNS = Math.trunc(performance.now() * 1e6);
    let count = fromCount ? this.channels[channel].counter : this.channels[channel].resetVal
    let nsFromNow = this.timerPeriodNS * count;
    this.channels[channel].timerID = this.system.clock.addTimer(
        nowNS + nsFromNow,
        () => this.handleChannelCount0(channel));
    this.channels[channel].running = true;
  }

  restartSquareWaveTimer(channel, count) {
    this.stopTimer(channel, true);

    // Add a new timer to the clock
    let nowNS = Math.trunc(performance.now() * 1e6);
    let nsFromNow = this.timerPeriodNS * count;
    this.channels[channel].timerID = this.system.clock.addTimer(
        nowNS + nsFromNow,
        () => this.handleSquareWaveTimer(channel));
  }

  /**
   * Stop a channel's timer
   *
   * @param channel {number} Channel of timer to stop
   * @param isSquareWaveTimer {boolean} Is this a rate timer?
   */
  stopTimer(channel, isSquareWaveTimer=false) {
    let timerId = (isSquareWaveTimer) ? this.channels[channel].squareWaveTimerId : this.channels[channel].timerID
    if (timerId !== null) {
      this.system.clock.removeTimer(timerId);
    }
    this.channels[channel].running = false;
  }

  /**
   * Handle a channel's count reaching 0
   *
   * @param channel {number} Channel of the timer which reached 0
   */
  handleChannelCount0(channel) {
    this.debug.info(`TIMER: Channel ${channel} reached 0`);

    // Update the count
    this.channels[channel].counter = 0;

    switch (this.channels[channel].mode) {
      case 0: // Mode 0 - Interrupt on Terminal Count
        // Output goes high and stays high.
        this.channels[channel].out = PIN_HIGH;
        this.channels[channel].outputFn(PIN_HIGH);
        // Counter wraps and continues
        this.restartTimer(channel);
        break;
      case 1: // Mode 1 - Programmable One Shot
        this.channels[channel].out = PIN_HIGH;
        this.channels[channel].outputFn(PIN_HIGH);
        // I don't think the counter resets in this mode
        break;
      case 2: // Mode 2 - Rate Generator
        // output goes low for one clock cycle, then returns to high.
        // HACK: I'm not timing this or tying it to the clock. Just going
        // low->high immediately. Should be fine?
        this.channels[channel].outputFn(PIN_LOW);
        this.channels[channel].outputFn(PIN_HIGH);
        this.channels[channel].out = PIN_HIGH;
        this.restartTimer(channel);
        break;
      case 3: // Mode 3 - Square Wave Generator
        this.restartTimer(channel);
        break;
      case 4: // Mode 4 - Software Triggered Strobe
        this.channels[channel].outputFn(PIN_LOW);
        this.channels[channel].outputFn(PIN_HIGH);
        this.channels[channel].out = PIN_HIGH;
        // I don't think the counter resets in this mode
        break;
      case 5: // Mode 5 - Hardware Triggered Strobe
        throw new FeatureNotImplementedException("Mode 5 timers not implemented");
    }
  }

  /**
   * A channel configured to generate a square wave will have the output pin
   * alternate high/low.
   *
   * @param channel Channel of timer to handle
   */
  handleSquareWaveTimer(channel) {
    this.debug.info(`TIMER: SquareWave Channel ${channel} reached 0`);
    if (this.channels[channel].out === PIN_HIGH) {
      this.channels[channel].out = PIN_LOW;
      this.channels[channel].outputFn(PIN_LOW);
    }
    else {
      this.channels[channel].out = PIN_HIGH;
      this.channels[channel].outputFn(PIN_HIGH);
    }
  }

  /**
   * Register a function to be called when a channel output pin changes value
   *
   * @param channel {number} Channel to register with
   * @param outputFn {function} Function to be called when output changes
   */
  registerChannelLister(channel, outputFn) {
    this.channels[channel].outputFn = outputFn;
  }

  boot() {}

  deviceCycle() {}
}