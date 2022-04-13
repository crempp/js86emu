# Current versions

**v0.1:** [Basic emulation](https://github.com/crempp/js86emu/releases/tag/v0.1)  Apr 22, 2014

Completes SE Code Golf challenge .

**v0.2:** [Extending on basic emulation]() Oct 5, 2014

Extends on the basic emulation and begins to load BIOS.

# Roadmap

The following are the major feature releases planned for js86emu. They are listed in no particular order.

**Complete rewrite towards complete emulation of XT**

Completely rewrite the emulator for node support which will allow for easy testing and debugging. Also a better structure and reuse of code. The goal of this version is complete emulation of an XT system.

Features
1. All instructions and addressing modes
1. IO port support

Tasks/Refactor/Fixes
1. Fix CMP sign extend, it should only happen when
  "If subtrahend is an immediate value it will be sign extended to the length of minuend"
  https://en.wikibooks.org/wiki/X86_Assembly/Control_Flow#Comparison_Instructions
  IDEA: this only happens for EV Ib addressing combos which have a size set to "v" so in Ib check if size is "v", if so sign extend
1. LOTS OF TESTS, catch up on tests
  1. writeMem8 and readMem8 - should be the same
  1. 8086: memory fill
  1. 8086: All instructions exist
  1. 8086: register array access is correct
1. Refactor CPU state as a class
1. Refactor timingCheck
  1. Is there a better way to prevent video sync skips
1. Review what flags each instruction modifies
1. Config files
1. Cleanup external doc folder, put it in drive and share it.

**Deployment**

Support continuous deployment and continuous integration.

Features
1. Integrate with CircleCI for Tests (CI)
1. Integrate with GitLab for CD deployment to DigitalOcean

Tasks/Refactor/Fixes
1. Script to generate fs.json

**Optimizations**

Eventually we'll need to focus on speed. There are many areas ripe for optimization but a quite a bit of micro optimizations are warranted.

Features
1. Ability to run at up to 4.77Mhz both on web and cli

Tasks/Refactor/Fixes
1. figure out a way to conditionally use optimizing flags in node. These don't work on my work laptop
```
  node --max_inlined_source_size=1200 --serialize_eager --max_inlining_levels=12 --max_inlined_nodes=2000 --max_inlined_nodes_absolute=12000 --max_inlined_nodes_cumulative=1000 --max_inlined_nodes_small=100 --min_inlining_frequency=0.6 ./dist/cli/cli.js"
```

**Full CLI**

Extend the command line runner to fuller functionality.

Features
1. Command line runner with parameters to control the functionality of the emulator
1. Full cli debugging - I'm thinking something like GDB.
  1. Memory breakpoints

**Full web**

Extend the web runner to fuller functionality.

Features
* Full web debugging
* Web workers for tasks like graphics rendering

**Electron Native Runner**

Investigate using Electron for running natively



# Functionality

----

## Instruction TODO List

## Data Transfer [2-31]

* general
	* √ MOV
	* √ PUSH
	* √ POP
	* √ XCHG
	*   XLAT
	* √ IN
	* √ OUT
* address object
	* √ LEA
	* √ LDS
	* √ LES
* flag
	* √ LAHF
	* √ SAHF
	* √ PUSHF
	* √ POPF

### Arithmetic [2-33]

* addition
	* √ ADD
	* √ ADC
	* √ INC
	* √ AAA
	*   DAA
* subtraction
	* √ SUB
	* √ SBB
	* √ DEC
	* √ NEG
	* √ CMP
	* √ AAS
	*   DAS
* multiplication
	* √ MUL
	*   IMUL
	*   AAM
* division
	*   DIV
	*   IDIV
	*   AAD
	*   CBW
	*   CWD

### √ Bit Manipulation [2-38]
* logical
	* √ NOT
	* √ AND
	* √ OR
	* √ XOR
	* √ TEST
* shifts
	* √ SHL/SAL
	* √ SHR
	* √ SAR
* rotates
	* √ ROL
	* √ ROR
	* √ RCL
	* √ RCR

### √ String [2-40]

* String
	* √ REP/REPE/REPZ/REPNE/REPNZ
	* √ MOVS
	* √ MOVSB/MOVSW
	* √ CMPS
	* √ SCAS
	* √ LODS
	* √ STOS

### √ Program Transfer [2-43]

* unconditional
	* √ CALL
	* √ RET
	* √ JMP
* conditional
	* √ J*
* iteration control
	* √ LOOP
	* √ LOOPE/LOOPZ
	* √ LOOPNE/LOOPNZ
	* √ JCXZ
* interrupt
	* √ INT
	* √ INTO
	* √ IRET

### Processor Control [2-47]

* √flag
	* √ CLC
	* √ CMC
	* √ STC
	* √ CLD
	* √ STD
	* √ CLI
	* √ STI
* external sync
	* o HLT
	*   WAIT
	*   ESC
	*   LOCK
* no operation
	* √ NOP

## √ Addressing TODO List
  * √ 1
  * √ 3
  * √ AX
  * √ AL
  * √ AH
  * √ BX
  * √ BL
  * √ BH
  * √ CX
  * √ CL
  * √ CH
  * √ DX
  * √ DL
  * √ DH
  * √ SI
  * √ DI
  * √ BP
  * √ SP
  * √ CS
  * √ DS
  * √ ES
  * √ SS
  * √ Ap
  * √ Eb
  * √ Ep
  * √ Ev
  * √ Ew
  * √ Gb
  * √ Gv
  * √ Ib
  * √ Iv
  * √ Iw
  * √ Jb
  * √ Jv
  * √ M
  * √ Mp
  * √ Ob
  * √ Ov
  * √ Sw


## Feature TODO List
* Auto generated documentation from code
* Render markdown docs and serve from site
* Reactify debug view
* Build library of systems (5150, 5160, etc)
* Build library of disk images/software/games
* Build interface for debug, docs, library, etc.
