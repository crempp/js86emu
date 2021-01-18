// Main Registers 8bit
export const regAL = 0;
export const regAH = 1;
export const regBL = 2;
export const regBH = 3;
export const regCL = 4;
export const regCH = 5;
export const regDL = 6;
export const regDH = 7;

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

// Flag registerPort
export const regFlags = 13;

export const FLAG_CF_MASK = 0x0001; // 0
                                    // 1
export const FLAG_PF_MASK = 0x0004; // 2
                                    // 3
export const FLAG_AF_MASK = 0x0010; // 4
                                    // 5
export const FLAG_ZF_MASK = 0x0040; // 6
export const FLAG_SF_MASK = 0x0080; // 7
export const FLAG_TF_MASK = 0x0100; // 8
export const FLAG_IF_MASK = 0x0200; // 9
export const FLAG_DF_MASK = 0x0400; // 10
export const FLAG_OF_MASK = 0x0800; // 11

// Sizes
export const b = 0; // Byte
export const w = 1; // Word
export const v = 2; // Varies
export const d = 3; // Double Word
export const u = 4; // Unknown

// System States
export const STATE_RUNNING = 0;
export const STATE_HALT    = 1;

// Repeat Prefix States
export const STATE_REP_NONE = 0;
export const STATE_REP      = 1;
export const STATE_REP_Z    = 2;
export const STATE_REP_NZ   = 3;

// Segment Prefix States
export const STATE_SEG_NONE = 0;
export const STATE_SEG_CS   = 1;
export const STATE_SEG_DS   = 2;
export const STATE_SEG_ES   = 3;
export const STATE_SEG_SS   = 4;

export const REP_PREFIX_INSTS = [0xF2, 0xF3];
export const SEG_PREFIX_INSTS = [0x2E, 0x3E, 0x26, 0x36];
export const REP_INSTS    = [0x6C, 0x6D, 0x6E, 0x6F, 0xA4, 0xA5, 0xAA, 0xAB, 0xAC, 0xAD];
export const REP_Z_INSTS  = [0xA6, 0xA7, 0xAE, 0xAF];
export const REP_NZ_INSTS = [0xA6, 0xA7, 0xAE, 0xAF];

export const NS_PER_SEC = 1e9;

export const PARITY = [
  /*         0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
  /* 0x00 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0x10 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0x20 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0x30 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0x40 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0x50 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0x60 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0x70 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0x80 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0x90 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0xA0 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0xB0 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0xC0 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
  /* 0xD0 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0xE0 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  /* 0xF0 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1
];
