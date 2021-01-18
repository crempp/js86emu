* IBM 5150 Bios is 8k
* At boot CS should be 0xFFFF and IP should be 0x0000 (reset vector)
* Reset vector is 0xFFFF:0x0000, which maps to physical address 0xFFFF0.
* Bytes 0x1FF0 to 0x1FF4 in the bios image should be EA, 00, E0, 00, F0
which decodes to JMPF F000: E000 which jumps to FE000 or byte 1 of the bios
