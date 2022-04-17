# Dev Log

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
