# TODO

## v0.1
* All instructions and addressing modes

*Refactor/fixes*
* √ Don't return values from instructions
* √ Fix Ep and Mp segments - still need done?
* √ Fix seg2abs, it still uses overrides, should use cpu.addrSeg
* Fix CMP sign extend, it should only happen when
  "If subtrahend is an immediate value it will be sign extended to the length of minuend"
  https://en.wikibooks.org/wiki/X86_Assembly/Control_Flow#Comparison_Instructions
  IDEA: this only happens for EV Ib addressing combos which have a size set to "v"
        so in Ib check if size is "v", if so sign extend
* √ Add these values to state
  * prefixRepeatState
* Clean up documentation

## v0.2
*Refactor/fixes*
* √ move to proper instructions for prefixes
* LOTS OF TESTS, catch up on tests
* Fix formatStack()
* Script to generate fs.json
* figure out a way to conditionally use optimizing flags in node. These don't work on my work laptop
  node --max_inlined_source_size=1200 --serialize_eager --max_inlining_levels=12 --max_inlined_nodes=2000 --max_inlined_nodes_absolute=12000 --max_inlined_nodes_cumulative=1000 --max_inlined_nodes_small=100 --min_inlining_frequency=0.6 ./dist/cli/cli.js"

## v0.3
* Refactor CPU state as a class
* √ add register values to CPUConfig (and more?)

## v0.4
* Refactor timingCheck
  * Is there a better way to prevent video sync skips
* √ Async RendererPNG with createWriteStream
* web workers for graphics rendering

## v0.5
* Doc generation
* Review what flags each inst modifies
* Debug tooling
  * Add memory break points
* Full CLI with options
* Config files

## Beyond
* Electron for for native (CLI) usage

Tests
* writeMem8 and readMem8 - should be the same
* 8086: memory fill
* 8086: All instructions exist
* 8086: register array access is correct


Docs
* Cleanup external doc folder, put it in drive and share it.


## Instruction TODO List
------------------

### Data Transfer 2-31

general
	√ MOV
	√ PUSH
	√ POP
	√ XCHG
	  XLAT
	√ IN
	√ OUT
address object
	√ LEA
	√ LDS
	√ LES
flag
	√ LAHF
	√ SAHF
	√ PUSHF
	√ POPF

### Arithmetic 2-33

addition
	√ ADD
	√ ADC
	√ INC
	  AAA
	  DAA
subtraction
	√ SUB
	√ SBB
	√ DEC
	√ NEG
	√ CMP
	  AAS
	  DAS
multiplication
	√ MUL
	  IMUL
	  AAM
division
	  DIV
	  IDIV
	  AAD
	  CBW
	  CWD

### √ Bit Manipulation 2-38
logical
	√ NOT
	√ AND
	√ OR
	√ XOR
	√ TEST
shifts
	√ SHL/SAL
	√ SHR
	√ SAR
rotates
	√ ROL
	√ ROR
	√ RCL
	√ RCR

### √ String 2-40

String
	√ REP/REPE/REPZ/REPNE/REPNZ
	√ MOVS
	√ MOVSB/MOVSW
	√ CMPS
	√ SCAS
	√ LODS
	√ STOS

### √ Program Transfer 2-43

unconditional
	√ CALL
	√ RET
	√ JMP
conditional
	√ J*
iteration control
	√ LOOP
	√ LOOPE/LOOPZ
	√ LOOPNE/LOOPNZ
	√ JCXZ
interrupt
	√ INT
	√ INTO
	√ IRET

### Processor Control 2-47

flag
	√ CLC
	√ CMC
	√ STC
	√ CLD
	√ STD
	√ CLI
	√ STI
external sync
	- HLT
	  WAIT
	  ESC
	  LOCK
no operation
	√ NOP

## Addressing TODO List
  √ 1
  √ 3
  √ AX
  √ AL
  √ AH
  √ BX
  √ BL
  √ BH
  √ CX
  √ CL
  √ CH
  √ DX
  √ DL
  √ DH
  √ SI
  √ DI
  √ BP
  √ SP
  √ CS
  √ DS
  √ ES
  √ SS
  √ Ap
  √ Eb
  √ Ep
  √ Ev
  √ Ew
  √ Gb
  √ Gv
  √ Ib
  √ Iv
  √ Iw
  √ Jb
  √ Jv
  √ M
  √ Mp
  √ Ob
  √ Ov
  √ Sw
