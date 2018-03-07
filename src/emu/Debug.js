import {
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from './Constants';

export function binString8 (value) {
  if (value === null || value === undefined) return "NULL";
  else return String("00000000" + value.toString(2)).slice(-8);
}

export function binString16 (value) {
  if (value === null || value === undefined) return "NULL";
  else return String("0000000000000000" + value.toString(2)).slice(-16);
}

export function hexString8 (value) {
  if (value === null || value === undefined) return "NULL";
  else return "0x" + String("00" + value.toString(16).toUpperCase()).slice(-2);
}

export function hexString16 (value) {
  if (value === null || value === undefined) return "NULL";
  else return "0x" + String("0000" + value.toString(16).toUpperCase()).slice(-4);
}

export function formatOpcode(opcode, indentSize=0) {
  let str = "";
  let indent = " ".repeat(indentSize);

  str += indent + "opcode:  " + binString8(opcode.opcode_byte) + "[" + hexString8(opcode.opcode_byte) + "]    ";
  str += "address: " + binString8(opcode.addressing_byte) + "[" + hexString8(opcode.addressing_byte) + "]\n";
  str += indent + "prefix:  " + binString8(opcode.prefix) + "[" + hexString8(opcode.prefix) + "]    ";
  str += "opcode:  " + binString8(opcode.opcode) + "[" + hexString8(opcode.opcode) + "]\n";
  str += indent + "d:       " + "       " + binString8(opcode.d).slice(-1) + "[" + hexString8(opcode.d) + "]    ";
  str += "w:       " + "       " + binString8(opcode.w).slice(-1) + "[" + hexString8(opcode.w) + "]\n";
  str += indent + "mod:     " + "      " + binString8(opcode.mod).slice(-2) + "[" + hexString8(opcode.mod) + "]    ";
  str += "reg:     " + "     " + binString8(opcode.reg).slice(-3) + "[" + hexString8(opcode.reg) + "]\n";
  str += indent + "rm:      " + "     " + binString8(opcode.rm).slice(-3) + "[" + hexString8(opcode.rm) + "]";

  return str;
}

export function formatMemory(mem8, from, to, indentSize=0) {
  let indent = " ".repeat(indentSize);
  let str = indent;

  let count = 1;
  for (let i = from; i <= to; i++) {
    str += "[" + hexString16(i) + "]: " + binString8(mem8[i]) + "(" + hexString8(mem8[i]) + ") ";
    if (count++ % 4 === 0 && i !== to) str += "\n" + indent;
  }

  return str;
}

export function formatFlags(flags, indentSize=0) {
  let indent = " ".repeat(indentSize);
  let str = "";

  str += indent + "CF: " + (flags & FLAG_CF_MASK);
  str += " PF: " + ((flags & FLAG_PF_MASK) >> 2);
  str += " AF: " + ((flags & FLAG_AF_MASK) >> 4) + "\n";
  str += indent + "ZF: " + ((flags & FLAG_ZF_MASK) >> 6);
  str += " SF: " + ((flags & FLAG_SF_MASK) >> 7);
  str += " TF: " + ((flags & FLAG_TF_MASK) >> 8) + "\n";
  str += indent + "IF: " + ((flags & FLAG_IF_MASK) >> 9);
  str += " DF: " + ((flags & FLAG_DF_MASK) >> 10);
  str += " OF: " + ((flags & FLAG_OF_MASK) >> 11);

  return str;
}
