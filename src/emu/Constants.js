// Main Registers 8bit
export const regAH = 1;
export const regAL = 2;
export const regBH = 3;
export const regBL = 4;
export const regCH = 5;
export const regCL = 6;
export const regDH = 7;
export const regDL = 8;

// Main Registers 16 bit
export const regAX = 0;
export const regBX = 2;
export const regCX = 3;
export const regDX = 4;

// Index registers
export const regSI = 5;
export const regDI = 6;
export const regBP = 7;
export const regSP = 8;

// Program counter
export const regIP = 9;

// Segment registers
export const regCS = 10;
export const regDS = 11;
export const regES = 12;
export const regSS = 13;

// Flag register
export const regFlags = 14;

export const FLAG_CF_MASK = 0x0001;
export const FLAG_PF_MASK = 0x0004;
export const FLAG_AF_MASK = 0x0010;
export const FLAG_ZF_MASK = 0x0040;
export const FLAG_SF_MASK = 0x0080;
export const FLAG_TF_MASK = 0x0100;
export const FLAG_IF_MASK = 0x0200;
export const FLAG_DF_MASK = 0x0400;
export const FLAG_OF_MASK = 0x0800;
