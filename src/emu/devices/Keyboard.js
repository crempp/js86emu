/**
 *
 */

const XT_KEYCODE_MAP = {
  "Backspace": null,
  "Tab": null,
  "Enter": null,
  "ShiftLeft": null,
  "ShiftRight": null,
  "ControlLeft": null,
  "ControlRight": null,
  "AltLeft": null,
  "AltRight": null,
  "Pause": null,
  "CapsLock": null,
  "Escape": null,
  "Space": null,
  "PageUp": null,
  "PageDown": null,
  "End": null,
  "Home": null,
  "ArrowLeft": null,
  "ArrowUp": null,
  "ArrowRight": null,
  "ArrowDown": null,
  "PrintScreen": null,
  "Insert": null,
  "Delete": null,
  "Digit0": null,
  "Digit1": null,
  "Digit2": null,
  "Digit3": null,
  "Digit4": null,
  "Digit5": null,
  "Digit6": null,
  "Digit7": null,
  "Digit8": null,
  "Digit9": null,
  "KeyA": null,
  "KeyB": null,
  "KeyC": null,
  "KeyD": null,
  "KeyE": null,
  "KeyF": null,
  "KeyG": null,
  "KeyH": null,
  "KeyI": null,
  "KeyJ": null,
  "KeyK": null,
  "KeyL": null,
  "KeyM": null,
  "KeyN": null,
  "KeyO": null,
  "KeyP": null,
  "KeyQ": null,
  "KeyR": null,
  "KeyS": null,
  "KeyT": null,
  "KeyU": null,
  "KeyV": null,
  "KeyW": null,
  "KeyX": null,
  "KeyY": null,
  "KeyZ": null,
  "MetaLeft": null,
  "MetaRight": null,
  "ContextMenu": null,
  "Numpad0": null,
  "Numpad1": null,
  "Numpad2": null,
  "Numpad3": null,
  "Numpad4": null,
  "Numpad5": null,
  "Numpad6": null,
  "Numpad7": null,
  "Numpad8": null,
  "Numpad9": null,
  "NumpadMultiply": null,
  "NumpadAdd": null,
  "NumpadSubtract": null,
  "NumpadDecimal": null,
  "NumpadDivide": null,
  "F1": null,
  "F2": null,
  "F3": null,
  "F4": null,
  "F5": null,
  "F6": null,
  "F7": null,
  "F8": null,
  "F9": null,
  "F10": null,
  "F11": null,
  "F12": null,
  "NumLock": null,
  "ScrollLock": null,
  "Semicolon": null,
  "Equal": null,
  "Comma": null,
  "Minus": null,
  "Period": null,
  "Slash": null,
  "Backquote": null,
  "BracketLeft": null,
  "Backslash": null,
  "BracketRight": null,
  "Quote": null,
};

export default class Keyboard {
  constructor(config, system) {
    this.config = config;
    this.system = system;
    this.debug = system.debug;
    this.resetTimer = null;
    this.buffer = null;

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  /**
   * Handle a key down browser event
   *
   * @param e Key event
   */
  handleKeyDown(e) {
    console.log(`${e.code} DOWN`);
    this.buffer = 0xFF;
  }

  /**
   * Handle a key up browser event
   *
   * @param e Key event
   */
  handleKeyUp(e) {
    console.log(`${e.code} UP`);
    this.buffer = 0xFE;
  }

  /**
   * Set a keyboard line to a value. This is primarily used for resetting the
   * keyboard.
   *
   * @param line Keyboard line to set
   * @param value Value to set line to
   */
  setLine(line, value) {
    if (line === "clk") {
      // If clock held low for 20ms then reset keyboard
      if (value === 0) {
        // We should wait for 20ms but the system may be running slow, so we
        // need to adjust for the speed the system is running, so we don't
        // fire the interrupt before the BIOS is ready. After 20ms reset the
        // keyboard.
        let timeScaleFactor = (1/this.system.clock.timeScale)*2;
        let time = Math.trunc(performance.now() * 1e6) + (2e7 * timeScaleFactor);
        this.resetTimer = this.system.clock.addTimer(time, () => { this.reset(); });
      }

    }
  }

  /**
   * Reset the keyboard
   *
   * TODO: investigate more about what an XT reset does.
   */
  reset() {
    // Send AA to the system
    this.buffer = 0xAA;

    // Trigger interrupt 0x01
    this.system.getDevice("PIC8259").triggerIRQ(0x01);

    // Remove timer
    this.system.clock.removeTimer(this.resetTimer);
    this.resetTimer = null;
  }

  clear() {
    this.buffer = null;
  }

  boot() {}
}