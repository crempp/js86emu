# Dev Log
### April 18th 2022
* Created Device, Card base classes and refactored a bunch of the the System, CPU and IO classes to move
  code to more appropriate classes (pushed down)

### April 17th 2022
* Started working on the I/O system. Read a lot. Got an idea of how to proceed but went on a major detour just 
  getting the browser working again. When code was running the browser was freezing. I realized the event loop was 
  consumed with the emulation loop. Tried setInterval but it was absurdly slow. Switched to use `setImmediate` to allow 
  other things to happen. Fixed it pretty well and is reasonably fast for the moment but definitely not fast enough.
* Now working on getting the bios booting. Found bios source listings here https://sites.google.
  com/site/pcdosretro/ibmpcbios
* There was a bug in SAHF, fixed and wrote test
* I think the NMI Mask Register (port 0xA0) is in the system board. The system should register that port?
  The register is write-only. Only bit 7 is used and 1 = Enable NMI
* NMI Mask Register (port 0xA0) is 74LS74 (U67) on the Mainboard [7] p.D-3

### April 16th 2022
* Clean up and wrote a bunch of tests. Test coverage now at 92%

### April 15th 2022
* Finished the DIV instruction. Mostly the same as IDIV, a little easier actually.
* I learned Javascript converts numbers to **signed integers** before doing bitwise operations. Therefore:
`0x800C << 16 = -2146697216` to fix use `>>> 0` as in `(0x800C << 16) >>> 0 = 2148270080`
* Finished the XLAT instruction
* Implemented WAIT.
  * I determined that the whole state thing and control pins on the processor need to be rethought. I will make it work for now and revisit later.
* I keep wanting to move cycle count to the CPU but I think it belongs with the system. Think of it as the clock, which is part of the main board. It may be worth putting it in its own ClockComponent.