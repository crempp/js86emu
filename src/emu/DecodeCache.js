import {segIP} from "./utils/Utils";

/**
 * Decode the current instruction pointed to by the IP registerPort.
 *
 * Opcode Structure
 *  opcode_byte:
 *  addressing_byte:
 *  prefix:
 *  opcode
 *  d:
 *  w:
 *  mod:
 *  reg:
 *  rm:
 *  addrSize
 *  isGroup (bool) Is the opcode a grouped opcode
 *  inst:
 *  string:
 *
 *
 */
export default class DecodeCache {
  cache = new Map();

  constructor(cpu) {
    this.cpu = cpu;
  }

  decode() {
    // TODO: Validate value at IP to avoid issue in case mem has been rewritten

    let ip = segIP(this.cpu);
    let oc;
    if (this.cache.has(ip)) {
      oc = this.cache.get(ip);
    }
    else {
      oc = this._decode(ip);
    }
    if (oc.inst === undefined) {
      debugger;
      ip = segIP(this.cpu);
    }

    return oc;
  }

  _decode(ip) {
    let opcode = {};

    let opcode_byte = this.cpu.mem8[ip];

    // Retrieve the operation from the opcode table
    let instruction = this.cpu.inst[opcode_byte];

    opcode["opcode_byte"]     = opcode_byte;
    opcode["addressing_byte"] = null;
    opcode["prefix"]          = 0x00;  // Not supporting prefix opcodes yet
    //opcode["opcode"]          = (opcode_byte & 0xFC) >>> 2;
    opcode["d"]               = (opcode_byte & 0x02) >>> 1;
    opcode["w"]               = (opcode_byte & 0x01);
    opcode["mod"]             = null;
    opcode["reg"]             = null;
    opcode["rm"]              = null;
    opcode["inst"]            = instruction;
    opcode["string"]          = "";
    opcode["addrSize"]        = null;
    opcode["isGroup"]         = (instruction instanceof Array);

    // If this instruction has an addressing mode byte decode it
    if (opcode.isGroup || opcode.inst.baseSize > 1) {
      opcode.addressing_byte = this.cpu.mem8[segIP(this.cpu) + 1];
      opcode.mod = (opcode.addressing_byte & 0xC0) >>> 6;
      opcode.reg = (opcode.addressing_byte & 0x38) >>> 3;
      opcode.rm = (opcode.addressing_byte & 0x07);
    }

    // If the instruction is an array it's a group instruction and we need
    // to extract further based on the registerPort component of the addressing
    // byte
    if (opcode.isGroup) {
      opcode.inst = opcode.inst[opcode.reg];
    }

    opcode.addrSize = opcode.inst.addrSize;

    if (this.cpu.config.debug || this.cpu.config.debugOpString) {
      opcode.string = opcode.inst.toString();
    }
    else {
      opcode.string = "DISABLED";
    }

    this.cache.set(ip, opcode);


    return opcode;
  }
}