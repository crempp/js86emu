js86emu
=======

x86 emulator written in Javascript.

Demo : http://lapinlabs.com/js86emu/

The plan is to emulate multiple x86 chips along with auxilary hardware such as
Harddisk controllers, BIOS and graphics.

The 8086 processor has ~72 instruction represented by 252 numeric opcodes (this actually depends on how you count the group instructions).

Currently

*  ~98 instructions decoded and mostly working
*  Functioning stack
*  Basic (non-segmented) memory
*  Pretty decent debugging (gotta have this)
*  Code Page 437 font set loads dynamically from a bitmap representation
*  Text mode (80x25) video (no interrupts yet)

We'll see how far I get :)

Quickstart
----
* Install Nodejs
* install Ruby
* 

TODO
----
* Fix operations which set src to an RM value, they over count IP increment. The following is the fix but care needs to be taken to determine which ops need it
  ```
  // correct for direct addressing IP counting
  if (0 === opcode.mod && 6 === opcode.rm)
  {
      _tempIP -= 2;
  }
  ```
* Add memory break points
* Update memory debug view to keep starting point of rows at a factor of 8 (currently the row begins at IP)

Test Programs
-------------
Test programs have been assembled with JWasm
jwasm -0 -fpc -ms -bin

Tests
-----
js86emu uses Mocha and should for it's tests. To run tests
  ```
  mocha
  ```

References
----------
* [IBM PS/2 Files](http://www.walshcomptech.com/selectpccbbs/)
* [Complete 8086 instruction set](http://www.gabrielececchetti.it/Teaching/CalcolatoriElettronici/Docs/i8086_instruction_set.pdf)
* [X86 Opcode and Instruction Chart](http://ref.x86asm.net/geek32.html)
* [Notes for 8086 emulation core instruction decoding](http://rubbermallet.org/8086%20notes.pdf)
* [Wikipedia X86 instruction listings](http://en.wikipedia.org/wiki/X86_instruction_listings)
* [Intel 80x86 Assembly Language OpCodes](http://www.mathemainzel.info/files/x86asmref.html)
* [Online Disassembler](http://www.onlinedisassembler.com/odaweb/)
* [Wikipedia article on the 8086](http://en.wikipedia.org/wiki/8086)
* [8086 Opcode Map](http://www.mlsite.net/8086/)
* [The Instruction Set of 8086](http://www.ing.unlp.edu.ar/electrotecnia/arcom1/UNDERSTANDING8085_8086_cap14_Instruccion_set.pdf)
* [Modes of Memory Addressing on x86](http://www.c-jump.com/CIS77/ASM/Memory/lecture.html)
* [Compile and Execute Assembly Online](http://www.compileonline.com/compile_assembly_online.php)

Notes
-----
* http://forum.osdev.org/viewtopic.php?f=13&t=26986