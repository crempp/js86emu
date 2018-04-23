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

export const STATE_RUNNING = 0;
export const STATE_HALT    = 1;

export const NS_PER_SEC = 1e9;
// ...
// PAUSED, STOPPED???

// export const FONT_PATH = "files/fonts/";

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
