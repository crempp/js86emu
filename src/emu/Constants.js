// Main Registers 8bit
export const regAH = 0;
export const regAL = 1;
export const regBH = 2;
export const regBL = 3;
export const regCH = 4;
export const regCL = 5;
export const regDH = 6;
export const regDL = 7;

// Main Registers 16 bit
export const regAX = 0;
export const regBX = 1;
export const regCX = 2;
export const regDX = 3;

// Index registers
export const regSI = 4;
export const regDI = 5;
export const regBP = 6;
export const regSP = 7;

// Program counter
export const regIP = 8;

// Segment registers
export const regCS = 9;
export const regDS = 10;
export const regES = 11;
export const regSS = 12;

// Flag register
export const regFlags = 13;

export const FLAG_CF_MASK = 0x0001;
export const FLAG_PF_MASK = 0x0004;
export const FLAG_AF_MASK = 0x0010;
export const FLAG_ZF_MASK = 0x0040;
export const FLAG_SF_MASK = 0x0080;
export const FLAG_TF_MASK = 0x0100;
export const FLAG_IF_MASK = 0x0200;
export const FLAG_DF_MASK = 0x0400;
export const FLAG_OF_MASK = 0x0800;
