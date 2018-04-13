export default class CPU {

  /**
   * Assemble the current CPU state in an object and return it.
   *
   * @return {Object} State encoded in an object
   */
  getState () {
    let tmpOpcode = this.opcode;
    delete tmpOpcode.inst;

    return {
      "cycleCount": this.cycleCount,
      "addrSeg":    this.addrSeg,
      "repType":    this.repType,
      "cycleIP":    this.cycleIP,
      "mem16":       this.mem16,//.buffer,
      "reg16":       this.reg16,//.buffer,
      "opcode":     tmpOpcode,
    };
  }

  /**
   * Restore the CPU state from the given object
   *
   * @param state
   */
  setState (state) {
    this.cycleCount = state["cycleCount"];
    this.addrSeg    = state["addrSeg"];
    this.repType    = state["repType"];
    this.cycleIP    = state["cycleIP"];
    this.mem16      = new Uint16Array(state["mem16"]);
    this.reg16      = new Uint16Array(state["reg16"]);
    this.opcode     = state["opcode"];

    // TODO: Refactor this so it's not copy/pasted
    // The instruction function is not saved/restored correctly from bjson so
    // we need to reset it.
    this.opcode.inst = this.inst[this.opcode.opcode_byte];
    if (this.opcode.inst instanceof Array) {
      this.opcode.inst = this.opcode.inst[this.opcode.reg];
    }
  }
}
