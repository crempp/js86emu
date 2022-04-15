# Dev Log

### April 15th 2022
* Finished the DIV instruction. Mostly the same as IDIV, a little easier actually.
* I learned Javascript converts numbers to **signed integers** before doing bitwise operations. Therefore:
`0x800C << 16 = -2146697216` to fix use `>>> 0` as in `(0x800C << 16) >>> 0 = 2148270080`

