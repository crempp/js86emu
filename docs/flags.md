MASK   BIT  Flag   NAME
0x0001 0    CF     Carry flag  S
0x0002 1    1      Reserved
0x0004 2    PF     Parity flag S
0x0008 3    0      Reserved
0x0010 4    AF     Adjust flag S
0x0020 5    0      Reserved
0x0040 6    ZF     Zero flag   S
0x0080 7    SF     Sign flag   S
0x0100 8    TF     Trap flag (single step) X
0x0200 9    IF     Interrupt enable flag   C
0x0400 10   DF     Direction flag  C
0x0800 11   OF     Overflow flag   S
0x1000 12,13 1,1   I/O privilege level (286+ only) always 1 on 8086 and 186
0x2000 14  1       Nested task flag (286+ only) always 1 on 8086 and 186
0x4000 15  1       on 8086 and 186, should be 0 above  Reserved
