export function binString8 (value) {
  return String("00000000" + value.toString(2)).slice(-8);
}

export function binString16 (value) {
  return String("0000000000000000" + value.toString(2)).slice(-16);
}

export function hexString8 (value) {
  return "0x" + String("00" + value.toString(16).toUpperCase()).slice(-2);
}

export function hexString16 (value) {
  return "0x" + String("0000" + value.toString(16).toUpperCase()).slice(-4);
}

export function formatOpcode(opcode) {
  let str = "";

  str += "opcode:  " + binString8(opcode.opcode_byte) + "[" + hexString8(opcode.opcode_byte) + "]    ";
  str += "address: " + binString8(opcode.addressing_byte) + "[" + hexString8(opcode.addressing_byte) + "]\n";
  str += "prefix:  " + binString8(opcode.prefix) + "[" + hexString8(opcode.prefix) + "]    ";
  str += "opcode:  " + binString8(opcode.opcode) + "[" + hexString8(opcode.opcode) + "]\n";
  str += "d:       " + "       " + binString8(opcode.d).slice(-1) + "[" + hexString8(opcode.d) + "]    ";
  str += "w:       " + "       " + binString8(opcode.w).slice(-1) + "[" + hexString8(opcode.w) + "]\n";
  str += "mod:     " + "      " + binString8(opcode.mod).slice(-2) + "[" + hexString8(opcode.mod) + "]    ";
  str += "reg:     " + "     " + binString8(opcode.reg).slice(-3) + "[" + hexString8(opcode.reg) + "]\n";
  str += "rm:      " + "     " + binString8(opcode.rm).slice(-3) + "[" + hexString8(opcode.rm) + "]";

  return str;
}

export function formatMemory(mem8, from, to) {
  let str = "";

  let count = 1;
  for (let i = from; i <= to; i++) {
    str += "[" + hexString16(i) + "]: " + binString8(mem8[i]) + "(" + hexString8(mem8[i]) + ") ";
    if (count++ % 4 === 0 && i !== to) str += "\n";
  }

  return str;
}
