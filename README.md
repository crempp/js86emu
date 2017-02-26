# js86emu
---------------------------------------

js86emu is an x86 architecture emulator written in Javascript. The goal of this project is to emulate multiple x86 chips along with auxilary hardware such as Harddisk controllers, BIOS and graphics.

A full web based GUI is planned. This includes an online disk library including storage and an online community for sharing and creation of disk images. The idea is that programs (games) will be installed on a disk image and then easily imported. This will ease the common frustrations involved with installation of PC based programs and games (himem.sys will already be configured in the disk image, just run the disk image).

This project started as result of my curiosity about how emulators work. One night I decided to do some research on emulators. I downloaded the DOSBox source code and started reading. I discoverd that the general ideas were not that complicated, the implementation could be complicated but mostly in a tedious way. I thought, "how hard could this be", and began my journey to discover the answer to that question.

I'd like to thank [copy](http://codegolf.stackexchange.com/users/3428/copy) from [Programming Puzzles & Code Golf](http://codegolf.stackexchange.com/) for the awesome [codegolf challenge](http://codegolf.stackexchange.com/questions/4732/emulate-an-intel-8086-cpu). The codegolf challenge included a test program with associated assembly without which I would have never gotten even close to the current level of completion.

Demo : [http://lapinlabs.com/js86emu/](http://lapinlabs.com/js86emu/)

# Current Progress
---------------------------------------

The 8086 processor has ~72 instruction represented by 252 numeric opcodes (this actually depends on how you count the group instructions).

Currently implememted features _(version 0.2 WIP)_

* ~98 instructions decoded and mostly working
* Functioning stack
* Basic (non-segmented) memory
* Pretty decent debugging (gotta have this)
* Code Page 437 font set loads dynamically from a bitmap representation
* Text mode (80x25) video (no interrupts yet)
* Multiple binary programs for running
* Barebones GUI (any designers out there?)

## Roadmap

Bold versions are complete

* __✓ 0.1 :__ Functional solution to the codegolf challenge. [Online Demo]( (http://lapinlabs.com/projects/js86emu/v0.1/)
* 0.2 : Full test coverage, full instruction coverage. [Online Demo]( (http://lapinlabs.com/projects/js86emu/v0.2/)
* 0.3 : BIOS support.
* 0.4 : Bootable disk support, boot a few test disks.
* 0.5 : Boot DOS.

## Un-scheduled features

These are features that don't have a home on the roadmap.

* Upload a custom binary to run
* Configuration engine
* Add memory break points
* Update memory debug view to keep starting point of rows at a factor of 8 (currently the row begins at IP)

# Development
---------------------------------------

Currently I'm a one-man development team. I have no plan to enlist the help of others (the one exception is if someone redesigned my frontend UI). That said, please feel free to fork this and go crazy.

## Quickstart

* Install Nodejs in a manner appropriate to your OS
* Install Ruby in a manner appropriate to your OS (needed for SASS)
* Install global node packages needed for testing
``` 
   $ npm install -g mocha
   $ npm install -g istanbul
   $ npm install -g grunt-cli
```
* Install node dependencies
  ```
     $ npm install
  ```
* Build the project
  ```
  $ grunt
  ```
* Run the server
  ```
  $ node server.js
  ```
* Access the app at http://127.0.0.1:8080

During development you'll want `grunt watch` to be running

## How To Assemble a Test Binary
For testing it is often helpful to write some Assembly, comile it and run it through the emulator. For comiling assembly into 8086 compatible binary I've only been successful with [JWasm](http://sourceforge.net/projects/jwasm/).
  ```
  jwasm -0 -fpc -ms -bin
  ```

# References
---------------------------------------
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
