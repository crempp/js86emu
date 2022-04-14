# x86 Addressing

## Overview

The following is taken from X86-64 Instruction Encoding on [OSDev.org](https://wiki.osdev.org/X86-64_Instruction_Encoding#ModR.2FM)

The ModR/M byte is used to encode up to two operands of an instruction, each of which is a direct register or effective memory address.

### ModR/M

The ModR/M byte encodes a register or an opcode extension, and a register or a memory address. It has the following fields:

```
  7                           0
+---+---+---+---+---+---+---+---+
|  mod  |    reg    |     rm    |
+---+---+---+---+---+---+---+---+
```

| Field      | Length | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 
|------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MODRM.mod  | 2 bits | In general, when this field is b11, then register-direct addressing mode is used; otherwise register-indirect addressing mode is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| MODRM.reg  | 3 bits | This field can have one of two values:<ul><li>A 3-bit opcode extension, which is used by some instructions but has no further meaning other than distinguishing the instruction from other instructions.</li><li>A 3-bit register reference, which can be used as the source or the destination of an instruction (depending on the instruction). The referenced register depends on the operand-size of the instruction and the instruction itself. See Registers for the values to use for each of the registers. The REX.R, VEX.~R or XOP.~R field can extend this field with 1 most-significant bit to 4 bits total.</li></ul> |
| MODRM.rm   | 3 bits | Specifies a direct or indirect register operand, optionally with a displacement. The REX.B, VEX.~B or XOP.~B field can extend this field with 1 most-significant bit to 4 bits total.                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### 16-bit addressing

These are the meanings of the Mod (vertically) and REX/VEX/XOP.B and R/M bits (horizontally) for 16-bit addressing. B.R/M and Mod are in binary. The SIB-byte is not used in 16-bit addressing. In Long processing mode there is no way to specify 16-bit addresses.

| Mod  | x.000<br />AX, R8W | x.001<br />CX, R9W | x.010<br />DX, R10W | x.011<br />BX, R11W | x.100<br />SP, R12W | x.101<br />BP, R13W | x.110<br />SI, R14W | x.111<br />DI, R15W |
|------|--------------------|--------------------|---------------------|---------------------|---------------------|---------------------|---------------------|---------------------|
| 00   | [BX + SI]          | [BX + DI]          | [BP + SI]           | [BP + DI]           | [SI]                | [DI]                | [disp16]            | [BX]                |
| 01   | [BX + SI + disp8]  | [BX + DI + disp8]  | [BP + SI + disp8]   | [BP + DI + disp8]   | [SI + disp8]        | [DI + disp8]        | [BP + disp8]        | [BX + disp8]        |
| 10   | [BX + SI + disp16] | [BX + DI + disp16] | [BP + SI + disp16]  | [BP + DI + disp16]  | [SI + disp16]       | [DI + disp16]       | [BP + disp16]       | [BX + disp16]       |
| 11   | r/m                | r/m                | r/m                 | r/m                 | r/m                 | r/m                 | r/m                 | r/m                 |

## Addressing Abbreviations

### A
Direct Address. The instruction has no ModR/M byte; the address of the operand is encoded
in the instruction; and no base register, index register, or scaling factor can be
applied (for example, far JMP (EA)).

### C
The reg field of the ModR/M byte selects a control register (for example,
MOV (0F20, 0F22)).

### D
The reg field of the ModR/M byte selects a debug register (for example,
MOV (0F21,0F23)).

### E
A ModR/M byte follows the opcode and specifies the operand. The operand is either a
general-purpose register or a memory address. If it is a memory address, the address is
computed from a segment register and any of the following values: a base register, an
index register, a scaling factor, a displacement.

### F
EFLAGS Register.

### G
The reg field of the ModR/M byte selects a general register (for example, AX (000)).

### I
Immediate data. The operand value is encoded in subsequent bytes of the instruction.

### J
The instruction contains a relative offset to be added to the instruction pointer register
(for example, JMP (0E9), LOOP).

### M
The ModR/M byte may refer only to memory (for example, BOUND, LES, LDS, LSS,
LFS, LGS, CMPXCHG8B).

### O
The instruction has no ModR/M byte; the offset of the operand is coded as a word or
double word (depending on address size attribute) in the instruction. No base register,
index register, or scaling factor can be applied (for example, MOV (A0–A3)).

### P
The reg field of the ModR/M byte selects a packed quadword MMX™ technology register.

### Q
A ModR/M byte follows the opcode and specifies the operand. The operand is either
an MMX™ technology register or a memory address. If it is a memory address, the address
is computed from a segment register and any of the following values: a base register,
an index register, a scaling factor, and a displacement.

### R
The mod field of the ModR/M byte may refer only to a general register (for example,
MOV (0F20-0F24, 0F26)).

### S
The reg field of the ModR/M byte selects a segment register (for example, MOV
(8C,8E)).

### T
The reg field of the ModR/M byte selects a test register (for example, MOV
(0F24,0F26)).

### V
The reg field of the ModR/M byte selects a packed SIMD floating-point register.

### W
An ModR/M byte follows the opcode and specifies the operand. The operand is either
a SIMD floating-point register or a memory address. If it is a memory address, the address
is computed from a segment register and any of the following values: a base register,
an index register, a scaling factor, and a displacement

### X
Memory addressed by the DS:SI register pair (for example, MOVS, CMPS, OUTS, or
LODS).

### Y
Memory addressed by the ES:DI register pair (for example, MOVS, CMPS, INS,
STOS, or SCAS).

* Source - [3] p.A-1




## Notes

If segment is not specified, as almost always, it is assumed to be ds, unless
base register is esp or ebp; in this case, the address is assumed to be
relative to ss

https://en.wikibooks.org/wiki/X86_Assembly/GAS_Syntax#cite_note-1



