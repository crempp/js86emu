## TODO

1
* Don't return values from instructions
* Fix Ep and Mp segments - still need done?
* Fix seg2abs, it still uses overrides, should use cpu.addrSeg

2
* move to proper instructions for prefixes
* Fix formatStack()

3
* Refactor CPU state as a class
* add register values to CPUConfig (and more?)

4
* Refactor timingCheck
  - Is there a better way to prevent video sync skips
* Async RendererPNG with createWriteStream
* web workers for graphics rendering

5
* Doc generation
* Review what flags each inst modifies

Tests
* writeMem8 and readMem8 - should be the same
* TODO: writeMem16 and readMem16 - should be the same

Data Transfer 2-31
------------------
general
	√ MOV
	√ PUSH
	√ POP
	√ XCHG
	  XLAT
	  IN
	  OUT
address object
	√ LEA
	√ LDS
	√ LES
flag
	√ LAHF
	√ SAHF
	√ PUSHF
	√ POPF

Arithmetic 2-33
---------------
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
	  MUL
	  IMUL
	  AAM
division
	  DIV
	  IDIV
	  AAD
	  CBW
	  CWD

Bit Manipulation 2-38
---------------------
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

String 2-40
-----------
	  REP/REPE/REPZ/REPNE/REPNZ
	  MOVS
	  MOVSB/MOVSW
	  CMPS
	  SCAS
	  LODS
	  STOS

Program Transfer 2-43
---------------------
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
interupt
	  INT
	  INTO
	  IRET

Processor Control 2-47
----------------------
flag
	√ CLC
	√ CMC
	√ STC
	√ CLD
	√ STD
	√ CLI
	√ STI
external sync
	  HLT
	  WAIT
	  ESC
	  LOCK
no operation
	√ NOP













