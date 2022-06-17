import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
  b, w, v, u, regFlags,
} from '../Constants';
import { ValueOverflowException, ValueUnderflowException } from "./Exceptions";
import {segIP} from "./Utils";


export default class Debug {
  constructor(system) {
    if (Debug._instance) {
      return Debug._instance
    }
    Debug._instance = this;

    this.system = system;
    this.debugMessageFIFO = [];
    this.queueSize = 100;
  }

  log(message, flush=false) {
    this.debugMessageFIFO.push({
      type: "log",
      str: message,
    });
    this.trim();
    if (flush) this.flush();
  }

  error(message, flush=false) {
    this.debugMessageFIFO.push({
      type: "error",
      str: message,
    });
    this.trim();
    if (flush) this.flush();
  }

  info(message, flush=false) {
    this.debugMessageFIFO.push({
      type: "info",
      str: message,
    });
    this.trim();
    if (flush) this.flush();
  }

  warn(message, flush=false) {
    this.debugMessageFIFO.push({
      type: "warn",
      str: message,
    });
    this.trim();
    if (flush) this.flush();
  }

  debug(message, flush=false) {
    this.debugMessageFIFO.push({
      type: "debug",
      str: message,
    });
    this.trim();
    if (flush) this.flush();
  }

  group(message) {
    this.debugMessageFIFO.push({
      type: "group",
      str: message,
    });
    this.trim();
  }

  groupEnd(message) {
    this.debugMessageFIFO.push({
      type: "groupEnd",
      str: message,
    });
    this.trim();
  }

  flush() {
    for (let i = 0; i < this.debugMessageFIFO.length; i++) {
      console[this.debugMessageFIFO[i].type](this.debugMessageFIFO[i].str);
    }
    this.debugMessageFIFO = [];
  }

  trim() {
    let start = Math.max(this.debugMessageFIFO.length - this.queueSize, 0);
    let end = this.debugMessageFIFO.length;
    this.debugMessageFIFO = this.debugMessageFIFO.slice(start, end);
  }

  /**
   * Print aggregate logState info
   *
   * @param {System} system System instance
   */
  logState() {
    // Styling - it doesn't work well with Jetbrains debugger
    // let headerStyle = "font-weight: bold; background-color: #cccccc; color:#262626";
    // let dataStyle = "font-weight: normal; background-color: #262626; color:#cccccc";
    // let defaultStyle = "font-weight: normal; background-color: inherit; color:inherit";

    this.group(`Running instruction cycle [${this.system.clock.cycles}]`);
    this.log(`  CS:IP:   ${hexString16(this.system.cpu.reg16[regCS])}:${hexString16(this.system.cpu.reg16[regIP])}`);
    this.log(`  INSTR:   ${this.system.cpu.opcode.string}\n${formatMemory(this.system.cpu.mem8, segIP(this.system.cpu), segIP(this.system.cpu) + 3, 11)}`);
    this.log(`  OPCODE:  ${formatOpcode(this.system.cpu.opcode, 11)}`);
    this.log(`  REGISTERS    \n${formatRegisters(this.system.cpu, 11)}`);
    this.log(`  FLAGS:   ${formatFlags(this.system.cpu.reg16[regFlags], 11)}`);
    this.groupEnd();

    // Misc displays
    // let disassembly = disassemble(this.system, segIP(this.system.cpu), segIP(this.system.cpu) + 11);
    // console.log(`  CODE:        \n${formatDisassembly(disassembly)}`);
    // console.log(`  MEMORY STACK:\n${formatStack(this.mem8, this.reg16[regSP], 0x1000, 11)}`);
  }
}


export function binString8 (value) {
  if (value > 0xFF) throw new ValueOverflowException("Value too large for binString8()");
  else if (value < 0) throw new ValueUnderflowException("Value can not be negative for binString8()");
  else if (value === null || value === undefined) return "NULL";
  else return String("00000000" + value.toString(2)).slice(-8);
}

export function binString16 (value) {
  if (value > 0xFFFF) throw new ValueOverflowException("Value too large for binString16()");
  else if (value < 0) throw new ValueUnderflowException("Value can not be negative for binString16()");
  else if (value === null || value === undefined) return "NULL";
  else return String("0000000000000000" + value.toString(2)).slice(-16);
}

export function binString32 (value) {
  if (value > 0xFFFFFFFF) throw new ValueOverflowException("Value too large for binString32()");
  else if (value < 0) throw new ValueUnderflowException("Value can not be negative for binString32()");
  else if (value === null || value === undefined) return "NULL";
  else return String("00000000000000000000000000000000" + value.toString(2)).slice(-32);
}

export function hexString8 (value) {
  if (value > 0xFF) throw new ValueOverflowException("Value too large for hexString8()");
  else if (value < 0) throw new ValueUnderflowException("Value can not be negative for hexString8()");
  else if (value === null || value === undefined) return "NULL";
  else return "0x" + String("00" + value.toString(16).toUpperCase()).slice(-2);
}

export function hexString16 (value) {
  if (value > 0xFFFF) throw new ValueOverflowException("Value too large for hexString16()");
  else if (value < 0) throw new ValueUnderflowException("Value can not be negative for hexString16()");
  else if (value === null || value === undefined) return "NULL";
  else return "0x" + String("0000" + value.toString(16).toUpperCase()).slice(-4);
}

export function hexString32 (value) {
  if (value > 0xFFFFFFFF) throw new ValueOverflowException("Value too large for hexString32()");
  else if (value < 0) throw new ValueUnderflowException("Value can not be negative for hexString32()");
  else if (value === null || value === undefined) return "NULL";
  else return "0x" + String("00000000" + value.toString(16).toUpperCase()).slice(-8);
}

export function formatOpcode(opcode, indentSize=0) {
  let str = "";
  let indent = " ".repeat(indentSize);

  let addressBin = opcode.addressing_byte ? binString8(opcode.addressing_byte) : "        ";
  let modBin = opcode.mod ? binString8(opcode.mod).slice(-2) : "  ";
  let rmBin = opcode.rm ? binString8(opcode.rm).slice(-3) : "   ";
  let regBin = opcode.reg ? binString8(opcode.reg).slice(-3) : "   ";

  let size;
  if (opcode.addrSize === b) size = 'b';
  else if (opcode.addrSize === w) size = 'w';
  else if (opcode.addrSize === v) size = 'v';
  else if (opcode.addrSize === u) size = '?';

  str += "opcode:  " + binString8(opcode.opcode_byte) + "[" + hexString8(opcode.opcode_byte) + "]    ";
  str += "address: " + addressBin + "[" + hexString8(opcode.addressing_byte) + "]";
  str += indent + "prefix:  " + binString8(opcode.prefix) + "[" + hexString8(opcode.prefix) + "]    \n";
  //str += "opcode:  " + binString8(opcode.opcode) + "[" + hexString8(opcode.opcode) + "]\n";
  str += indent + "d:       " + "       " + binString8(opcode.d).slice(-1) + "[" + hexString8(opcode.d) + "]    ";
  str += "w:       " + "       " + binString8(opcode.w).slice(-1) + "[" + hexString8(opcode.w) + "]           ";
  str += "size:           " + size + "\n";
  str += indent + "mod:     " + "      " + modBin + "[" + hexString8(opcode.mod) + "]    ";
  str += "reg:     " + "     " + regBin + "[" + hexString8(opcode.reg) + "]";
  str += indent + "rm:      " + "     " + rmBin + "[" + hexString8(opcode.rm) + "]    ";



  return str;
}

export function formatMemory(mem8, from, to, indentSize=0) {
  let indent = " ".repeat(indentSize);
  let str = indent;

  let count = 1;
  for (let i = from; i <= to; i++) {
    str += "[" + hexString32(i) + "]: " + hexString8(mem8[i]);
    if (count++ % 4 === 0 && i !== to) str += "\n" + indent;
    else if (i !== to) str += "    ";
  }

  return str;
}

export function formatStack(mem8, top, bottom, indentSize=0) {
  let indent = " ".repeat(indentSize);
  let str = indent;

  for (let i = top; i <= bottom; i++) {
    str += "[" + hexString16(i) + "]";
  }
  str += "\n" + indent;
  for (let i = top; i <= bottom; i++) {
    str += "  " + hexString8(mem8[i]) + "  ";
  }

  return str;
}

export function formatRegisters(cpu, indentSize=0) {
  let str = "";
  let indent = " ".repeat(indentSize);

  str += indent;
  str += "IP: " + hexString16(cpu.reg16[regIP]) + "\n";

  str += indent;
  str += "AX: " + hexString16(cpu.reg16[regAX]) + " | ";
  str += "AL: " + hexString8(cpu.reg8[regAL]) + " ";
  str += "AH: " + hexString8(cpu.reg8[regAH]) + " || ";
  str += "CS: " + hexString16(cpu.reg16[regCS]) + " || ";
  str += "SI: " + hexString16(cpu.reg16[regSI]) + " ||\n";

  str += indent;
  str += "BX: " + hexString16(cpu.reg16[regBX]) + " | ";
  str += "BL: " + hexString8(cpu.reg8[regBL]) + " ";
  str += "BH: " + hexString8(cpu.reg8[regBH]) + " || ";
  str += "DS: " + hexString16(cpu.reg16[regDS]) + " || ";
  str += "DI: " + hexString16(cpu.reg16[regDI]) + " ||\n";

  str += indent;
  str += "CX: " + hexString16(cpu.reg16[regCX]) + " | ";
  str += "CL: " + hexString8(cpu.reg8[regCL]) + " ";
  str += "CH: " + hexString8(cpu.reg8[regCH]) + " || ";
  str += "ES: " + hexString16(cpu.reg16[regES]) + " || ";
  str += "BP: " + hexString16(cpu.reg16[regBP]) + " ||\n";

  str += indent;
  str += "DX: " + hexString16(cpu.reg16[regDX]) + " | ";
  str += "DL: " + hexString8(cpu.reg8[regDL]) + " ";
  str += "DH: " + hexString8(cpu.reg8[regDH]) + " || ";
  str += "SS: " + hexString16(cpu.reg16[regSS]) + " || ";
  str += "SP: " + hexString16(cpu.reg16[regSP]) + " ||";

  return str;
}

export function formatFlags(flags, indentSize=0) {
  let indent = " ".repeat(indentSize);
  let str = "";

  str += indent + "OF: " + ((flags & FLAG_OF_MASK) >> 11);
  str += " DF: " + ((flags & FLAG_DF_MASK) >> 10);
  str += " IF: " + ((flags & FLAG_IF_MASK) >> 9);
  str += " TF: " + ((flags & FLAG_TF_MASK) >> 8);
  str += " SF: " + ((flags & FLAG_SF_MASK) >> 7);
  str += " ZF: " + ((flags & FLAG_ZF_MASK) >> 6);
  str += " AF: " + ((flags & FLAG_AF_MASK) >> 4);
  str += " PF: " + ((flags & FLAG_PF_MASK) >> 2);
  str += " CF: " + (flags & FLAG_CF_MASK);

  return str;
}

function disassemble(system, from, to, ip) {
  // TODO: Can't currently get access to addrIPInc for variable size instructions. Need a refactor to make this work.
  // TODO: Cache the disassembly
  // TODO: Support lookback disassembly (could use the cache)
  let disassembly = [];
  let addr = from;
  let i = 0;
  while (addr <= to) {
    let inst = system.cpu.inst[system.cpu.mem8[addr]];
    let size = inst.baseSize; //+ inst.addrSize
    let hex = [];
    for (let j = 0; j < size; j++){
      hex.push(system.cpu.mem8[addr + j]);
    }
    disassembly[i] = {
      isCurrent: (addr === from),
      inst: [inst.opName(), inst.dstName(), inst.srcName()],
      addr: addr,
      size: size,
      hex: hex,
    }
    addr += size;
    i++;
  }
  return disassembly;
}

function formatDisassembly(disassembly, indentSize) {
  let indent = " ".repeat(indentSize);
  let str = "";

  for (let i = 0; i < disassembly.length; i++) {
    let pointer = (disassembly[i].isCurrent)? "->" : "  ";
    let hex = disassembly[i].hex.map(x => hexString16(x)).join(' ')
    str += `${indent}${pointer} ${hexString32(disassembly[i].addr)} [${hex.padEnd(34)}] ${disassembly[i].inst[0]} ${disassembly[i].inst[1]} ${disassembly[i].inst[2]}\n`;
  }
  return str;
}