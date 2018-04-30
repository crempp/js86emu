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
      "addrSeg":            this.addrSeg,
      "repType":            this.repType,
      "instIPInc":          this.instIPInc,
      "addrIPInc":          this.addrIPInc,
      "mem16":              this.mem16,
      "reg16":              this.reg16,
      "opcode":             tmpOpcode,
      "state":              this.state,
      "prefixRepeatState":  this.prefixRepeatState,
      "prefixSegmentState": this.prefixSegmentState,
    };
  }

  /**
   * Restore the CPU state from the given object
   *
   * @param state
   */
  setState (state) {
    this.addrSeg            = state["addrSeg"];
    this.repType            = state["repType"];
    this.instIPInc          = state["instIPInc"];
    this.addrIPInc          = state["addrIPInc"];
    this.mem16              = new Uint16Array(state["mem16"]);
    this.reg16              = new Uint16Array(state["reg16"]);
    this.opcode             = state["opcode"];
    this.state              = state["state"];
    this.prefixRepeatState  = state["prefixRepeatState"];
    this.prefixSegmentState = state["prefixSegmentState"];


    // TODO: Refactor this so it's not copy/pasted
    // The instruction function is not saved/restored correctly from bjson so
    // we need to reset it.
    this.opcode.inst = this.inst[this.opcode.opcode_byte];
    if (this.opcode.inst instanceof Array) {
      this.opcode.inst = this.opcode.inst[this.opcode.reg];
    }
  }
}
