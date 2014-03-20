var cpu8086 = {
    _opcode  : 0x00,
    _memory  : null,
    _memoryV : null,

    halt     : false,
    
    // Main Registers
    _regAH : null, _regAL : null, // primary accumulator
    _regBH : null, _regBL : null, // base, accumulator
    _regCH : null, _regCL : null, // counter, accumulator
    _regDH : null, _regDL : null, // accumulator, other functions
    
    // Index registers
    _regSI : null, // Source Index
    _regDI : null, // Destination Index
    _regBP : null, // Base Pointer
    _regSP : null, // Stack Pointer
    
    // Program counter
    _regIP : null, // Instruction Pointer
    
    // Segment registers
    _regCS : null, // Code Segment
    _regDS : null, // Data Segment
    _regES : null, // ExtraSegment
    _regSS : null, // Stack Segment
    
    // Status register
    // MASK   BIT  Flag   NAME
    // 0x0001 0    CF     Carry flag  S
    // 0x0002 1    1      Reserved
    // 0x0004 2    PF     Parity flag S
    // 0x0008 3    0      Reserved
    // 0x0010 4    AF     Adjust flag S
    // 0x0020 5    0      Reserved
    // 0x0040 6    ZF     Zero flag   S
    // 0x0080 7    SF     Sign flag   S
    // 0x0100 8    TF     Trap flag (single step) X
    // 0x0200 9    IF     Interrupt enable flag   C
    // 0x0400 10   DF     Direction flag  C
    // 0x0800 11   OF     Overflow flag   S
    // 0x1000 12,13 1,1   I/O privilege level (286+ only) always 1 on 8086 and 186
    // 0x2000 14  1       Nested task flag (286+ only) always 1 on 8086 and 186
    // 0x4000 15  1       on 8086 and 186, should be 0 above  Reserved
    _regFlags : null,

    FLAG_CF_MASK : 0x0001,
    FLAG_PF_MASK : 0x0004,
    FLAG_AF_MASK : 0x0010,
    FLAG_ZF_MASK : 0x0040,
    FLAG_SF_MASK : 0x0080,
    FLAG_TF_MASK : 0x0100,
    FLAG_IF_MASK : 0x0200,
    FLAG_DF_MASK : 0x0400,
    FLAG_OF_MASK : 0x0800,

    /**
     * Looks up the correct register to use based on the w and reg
     * values in the opcode.
     *
     * Returns the value from the register
     *
     * @param w
     * @param reg
     * @private
     */
    _getRegValueForOp : function (w, reg) {
        if (0 === w)
        {
            switch (reg)
            {
                case 0:
                    if (cpu.isDebug()) console.log("Using register AL (byte)");
                    return this._regAL;
                case 1:
                    if (cpu.isDebug()) console.log("Using register CL (byte)");
                    return this._regCL;
                case 2:
                    if (cpu.isDebug()) console.log("Using register DL (byte)");
                    return this._regDL;
                case 3:
                    if (cpu.isDebug()) console.log("Using register BL (byte)");
                    return this._regBL;
                case 4:
                    if (cpu.isDebug()) console.log("Using register AH (byte)");
                    return this._regAH;
                case 5:
                    if (cpu.isDebug()) console.log("Using register BH (byte)");
                    return this._regBH;
                case 6:
                    if (cpu.isDebug()) console.log("Using register CH (byte)");
                    return this._regCH;
                case 7:
                    if (cpu.isDebug()) console.log("Using register DH (byte)");
                    return this._regDH;
                default:
                    throw "Invalid reg table lookup parameters";
            }
        }
        else if (1 === w)
        {
            switch (reg)
            {
                case 0:
                    if (cpu.isDebug()) console.log("Using register AX (word)");
                    return ((this._regAH << 8) | this._regAL);
                case 1:
                    if (cpu.isDebug()) console.log("Using register CX (word)");
                    return ((this._regCH << 8) | this._regCL);
                case 2:
                    if (cpu.isDebug()) console.log("Using register DX (word)");
                    return ((this._regDH << 8) | this._regDL);
                case 3:
                    if (cpu.isDebug()) console.log("Using register BX (word)");
                    return ((this._regBH << 8) | this._regBL);
                case 4:
                    if (cpu.isDebug()) console.log("Using register SP (word)");
                    return this._regSP;
                case 5:
                    if (cpu.isDebug()) console.log("Using register BP (word)");
                    return this._regBP;
                case 6:
                    if (cpu.isDebug()) console.log("Using register SI (word)");
                    return this._regSI;
                case 7:
                    if (cpu.isDebug()) console.log("Using register DI (word)");
                    return this._regDI;
                default:
                    throw "Invalid reg table lookup parameters";
            }
        }
        else
        {
            throw "Invalid reg table lookup parameters";
        }
    },

    /**
     * Looks up the correct register to use based on the w and reg
     * values in the opcode.
     *
     * Sets the register to the given value
     *
     * @param w
     * @param reg
     * @param value
     * @private
     */
    _setRegValueForOp : function (w, reg, value) {
        if (0 === w)
        {
            switch (reg)
            {
                case 0: this._regAL = value; break;
                case 1: this._regCL = value; break;
                case 2: this._regDL = value; break;
                case 3: this._regBL = value; break;
                case 4: this._regAH = value; break;
                case 5: this._regBH = value; break;
                case 6: this._regCH = value; break;
                case 7: this._regDH = value; break;
            }
        }
        else if (1 === w)
        {
            switch (reg)
            {
                case 0: this._regAH = (value >>> 8); this._regAL = (value & 0xFF); break;
                case 1: this._regCH = (value >>> 8); this._regCL = (value & 0xFF); break;
                case 2: this._regDH = (value >>> 8); this._regDL = (value & 0xFF); break;
                case 3: this._regBH = (value >>> 8); this._regBL = (value & 0xFF); break;
                case 4: this._regSP = value; break;
                case 5: this._regBP = value; break;
                case 6: this._regSI = value; break;
                case 7: this._regDI = value; break;
            }
        }
        else
        {
            throw "Invalid reg table lookup parameters";
        }
    },

    reset : function ()
    {
        console.log("initialize");

        this.halt = false;

        // Initialize registers and memory once
        this._opcode = 0x00;

        this._memory  = new ArrayBuffer(1048576); // 1,048,576 bytes (1MB)
        this._memoryV = new Uint8Array(this._memory);

        // Main Registers
        this._regAH = 0x00; this._regAL = 0x00;
        this._regBH = 0x00; this._regBL = 0x00;
        this._regCH = 0x00; this._regCL = 0x00;
        this._regDH = 0x00; this._regDL = 0x00;
        this._regSI = 0x0000;
        this._regDI = 0x0000;
        this._regBP = 0x0000;

        // Not sure what this should be, codegolf only works if it's 0x100
        //this._regSP = 0xFFFE;
        this._regSP = 0x0100;

        // Program counter
        this._regIP = 0x0000;

        // Segment registers
        this._regCS = 0x0000;
        this._regDS = 0x0000;
        this._regES = 0x0000;
        this._regSS = 0x0000;

        // Status register
        this._regFlags = 0xF000;
    },

    loadBinary : function (addr, blob)
    {
        console.log("loadBinary");
        var av = new Uint8Array(blob);
        this._memoryV.set(av, addr);
    },

    /**
     *
     */
    emulateCycle : function ()
    {
        // Some common variables
        var valSrc, valDst, valResult;

        //var flag = 0x00;

        // Fetch Opcode
        var opcode_byte     = this._memoryV[this._regIP];
        var addressing_byte = this._memoryV[this._regIP + 1];

        //====Decode Opcode====
        var opcode = {
                prefix : null, // Not supporting prefix opcodes yet
                opcode : (opcode_byte & 0xFC) >>> 2,
                d      : (opcode_byte & 0x02) >>> 1,
                w      : (opcode_byte & 0x01),
                mod    : (addressing_byte & 0xC0) >>> 6,
                reg    : (addressing_byte & 0x38) >>> 3,
                rm     : (addressing_byte & 0x07)
        };

        if (cpu.isDebug()) gui.displayDecode(opcode_byte, addressing_byte, opcode);

        //====Execute Opcode====
        switch (opcode_byte)
        {
            /**
             * Two-byte instructions
             */
            case 0x0F :
                var opcode_byte_2 = this._memoryV[this._regIP + 1];
                console.log("Two-byte opcode - not supported! [" + opcode_byte_2.toString(16) + "]");
                break;


            /**
             * Instruction : CLC
             * Meaning     : Clear Carry flag.
             * Notes       :
             */
            case 0xF8:
                this._regFlags &= ~this.FLAG_CF_MASK;
                this._regIP += 1;
                break;

            /**
             * Instruction : CLI
             * Meaning     : Clear Interrupt flag.
             * Notes       :
             */
            case 0xFA:
                this._regFlags &= ~this.FLAG_IF_MASK;
                this._regIP += 1;
                break;

            /**
             * Instruction : CLD
             * Meaning     : Clear Direction flag.
             * Notes       :
             */
            case 0xFC:
                this._regFlags &= ~this.FLAG_DF_MASK;
                this._regIP += 1;
                break;

            /**
             * Instruction : DEC
             * Meaning     : Decrement by 1
             * Notes       :
             */
            case 0x48 :
                var regX = ((this._regAH << 8) | this._regAL);
                var result = regX - 1;
                this._regAH = (result & 0xFF00) >> 8;
                this._regAL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x49 :
                var regX = ((this._regCH << 8) | this._regCL);
                var result = regX - 1;
                this._regCH = (result & 0xFF00) >> 8;
                this._regCL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x4A :
                var regX = ((this._regDH << 8) | this._regDL);
                var result = regX - 1;
                this._regDH = (result & 0xFF00) >> 8;
                this._regDL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x4B :
                var regX = ((this._regBH << 8) | this._regBL);
                var result = regX - 1;
                this._regBH = (result & 0xFF00) >> 8;
                this._regBL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x4C :
                var regX = this._regSP;
                var result = regX - 1;
                this._regSP = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x4D :
                var regX = this._regBP;
                var result = regX - 1;
                this._regBP = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x4E :
                var regX = this._regSI;
                var result = regX - 1;
                this._regSI = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x4F :
                var regX = this._regDI;
                var result = regX - 1;
                this._regDI = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;

            /**
             * Instruction : GRP1
             * Meaning     : Group Opcode 1
             * Notes       :
             */
            case 0x80:
            case 0x81:
            case 0x82:
            case 0x83:

                valDst = this._getRegValueForOp(opcode.w, opcode.rm);

                if (0x80 === opcode_byte)
                {
                    valSrc = ((this._memoryV[this._regIP + 3] << 8) | this._memoryV[this._regIP + 2]);

                    this._regIP += 3;
                }
                else if (0x81 === opcode_byte)
                {
                    valSrc = ((this._memoryV[this._regIP + 3] << 8) | this._memoryV[this._regIP + 2]);

                    this._regIP += 4;
                }
                else if (0x82 === opcode_byte)
                {
                    valSrc = ((this._memoryV[this._regIP + 3] << 8) | this._memoryV[this._regIP + 2]);

                    this._regIP += 4;
                }
                else if (0x83 === opcode_byte)
                {
                    valSrc = this._memoryV[this._regIP + 2];

                    // Sign extend to word
                    if ( 1 === ( (valSrc & 0x80) >> 7)) valSrc = 0xFF00 | valSrc;

                    this._regIP += 3;
                }

                switch (opcode.reg) {
                    case 1 :
                        console.log("Opcode not implemented!");
                        break;
                    case 2 :
                        console.log("Opcode not implemented!");
                        break;
                    case 3 :
                        console.log("Opcode not implemented!");
                        break;
                    case 4 :
                        console.log("Opcode not implemented!");
                        break;
                    case 5 :
                        console.log("Opcode not implemented!");
                        break;
                    case 6 :
                        console.log("Opcode not implemented!");
                        break;
                    /**
                     * Instruction : CMP
                     * Meaning     : Compare
                     * Notes       :
                     */
                    case 7 :
                        valResult = valDst - valSrc;

                        this._setFlags(
                            valDst,
                            valSrc,
                            valResult,
                            (   this.FLAG_CF_MASK |
                                this.FLAG_ZF_MASK |
                                this.FLAG_SF_MASK |
                                this.FLAG_OF_MASK |
                                this.FLAG_PF_MASK |
                                this.FLAG_AF_MASK),
                            'w');

                        break;
                    default :
                        console.log("Invalid opcode!");
                }
                break;

            /**
             * Instruction : HLT
             * Meaning     : Halt the System
             * Notes       :
             */
            case 0xF4:
                this.halt = true;
                break;

            /**
             * Instruction : INC
             * Meaning     : Increment by 1
             * Notes       :
             */
            case 0x40 :
                var regX = ((this._regAH << 8) | this._regAL);
                var result = regX + 1;
                this._regAH = (result & 0xFF00) >> 8;
                this._regAL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x41 :
                var regX = ((this._regCH << 8) | this._regCL);
                var result = regX + 1;
                this._regCH = (result & 0xFF00) >> 8;
                this._regCL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x42 :
                var regX = ((this._regDH << 8) | this._regDL);
                var result = regX + 1;
                this._regDH = (result & 0xFF00) >> 8;
                this._regDL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x43 :
                var regX = ((this._regBH << 8) | this._regBL);
                var result = regX + 1;
                this._regBH = (result & 0xFF00) >> 8;
                this._regBL = (result & 0x00FF);

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x44 :
                var regX = this._regSP;
                var result = regX + 1;
                this._regSP = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x45 :
                var regX = this._regBP;
                var result = regX + 1;
                this._regBP = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x46 :
                var regX = this._regSI;
                var result = regX + 1;
                this._regSI = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;
            case 0x47 :
                var regX = this._regDI;
                var result = regX + 1;
                this._regDI = result;

                this._setFlags(
                    regX,
                    1,
                    result,
                    (   this.FLAG_ZF_MASK |
                        this.FLAG_SF_MASK |
                        this.FLAG_OF_MASK |
                        this.FLAG_PF_MASK |
                        this.FLAG_AF_MASK),
                    'w');

                this._regIP += 1;

                break;

            /**
             * Instruction : JO
             * Meaning     : Short Jump on overflow
             * Notes       :
             */
            case 0x70:
                if ( 1 === (this._regFlags & this.FLAG_OF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JNO
             * Meaning     : Short Jump if Not Overflow.
             * Notes       :
             */
            case 0x71:
                if ( 0 === (this._regFlags & this.FLAG_OF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JB / JNAE
             * Meaning     : Short Jump Below / Short Jump Above or Equal.
             * Notes       :
             */
            case 0x72:
                if ( 1 === (this._regFlags & this.FLAG_CF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JNB / JAE
             * Meaning     : Short Jump on Not Below / Short Jump Above or Equal.
             * Notes       :
             */
            case 0x73:
                if ( 0 === (this._regFlags & this.FLAG_CF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JZ / JE
             * Meaning     : Short Jump if Zero (equal).
             * Notes       : TESTED!
             */
            case 0x74:
                if ( 1 <= (this._regFlags & this.FLAG_ZF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JNZ / JNE
             * Meaning     : Short Jump Not Zero / Short Jump Not Equal.
             * Notes       :
             */
            case 0x75:
                if (0 === (this._regFlags & this.FLAG_ZF_MASK))
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JBE / JNA
             * Meaning     : Short Jump Below or Equal / Short Jump Not Above.
             * Notes       :
             */
            case 0x76:
                if ( 1 === (this._regFlags & this.FLAG_CF_MASK) ||
                     1 === (this._regFlags & this.FLAG_ZF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JA / JNBE
             * Meaning     : Short Jump Below or Equal / Short Jump Not Above.
             * Notes       :
             */
            case 0x77:
                if ( !(this._regFlags & this.FLAG_CF_MASK) & !(this._regFlags & this.FLAG_ZF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JS
             * Meaning     : Short Jump Signed
             * Notes       :
             */
            case 0x78:
                if ( this._regFlags & this.FLAG_SF_MASK)
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JNS
             * Meaning     : Short Jump Not Signed
             * Notes       :
             */
            case 0x79:
                if ( !( this._regFlags & this.FLAG_SF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JPE / JP
             * Meaning     : Short Jump on Parity Even / Short Jump on Parity
             * Notes       :
             */
            case 0x7A:
                if ( this._regFlags & this.FLAG_PF_MASK)
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JPO / JNP
             * Meaning     : Short Jump on Parity Odd / Short Jump Not Parity
             * Notes       :
             */
            case 0x7B:
                if ( !( this._regFlags & this.FLAG_PF_MASK) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JL / JNGE
             * Meaning     : Short Jump Less / Short Jump Not Greater or Equal
             * Notes       :
             */
            case 0x7C:
                if ( this._regFlags & this.FLAG_SF_MASK !== this._regFlags & this.FLAG_OF_MASK )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JGE / JNL
             * Meaning     : Short Jump Greater or Equal / Short Jump Not Less
             * Notes       :
             */
            case 0x7D:
                if ( this._regFlags & this.FLAG_SF_MASK === this._regFlags & this.FLAG_OF_MASK )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JLE / JNG
             * Meaning     : Short Jump Less or Equal / Short Jump Not Greater
             * Notes       :
             */
            case 0x7E:
                if ( this._regFlags & this.FLAG_ZF_MASK ||
                    (this._regFlags & this.FLAG_SF_MASK !== this._regFlags & this.FLAG_OF_MASK ) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : JG / JNLE
             * Meaning     : Short Jump Greater / Short Jump Not Less or Equal
             * Notes       :
             */
            case 0x7F:
                if ( !(this._regFlags & this.FLAG_ZF_MASK) ||
                    (this._regFlags & this.FLAG_SF_MASK === this._regFlags & this.FLAG_OF_MASK ) )
                {
                    this._shortJump();
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : MOV
             * Meaning     : Copy operand2 to operand1.
             * Notes       : This instruction has no addressing byte
             * Length      : 2-6 bytes
             * Cycles      :
             *   The MOV instruction cannot:
             *    - set the value of the CS and IP registers.
             *    - copy value of one segment register to another segment
             *      register (should copy to general register first).
             *    - copy immediate value to segment register (should copy to
             *      general register first).
             */
            // Move ?????
            case 0x88:
                console.log("Opcode not implemented!");
                break;
            case 0x89:
                console.log("Opcode not implemented!");
                break;
            case 0x8A:
                console.log("Opcode not implemented!");
                break;
            case 0x8B:
                console.log("Opcode not implemented!");
                break;
            case 0x8C:
                console.log("Opcode not implemented!");
                break;
            case 0x8E:
                console.log("Opcode not implemented!");
                break;
            // Move with displacement ???
            case 0xA0:
                console.log("Opcode not implemented!");
                break;
            case 0xA1:
                console.log("Opcode not implemented!");
                break;
            case 0xA2:
                console.log("Opcode not implemented!");
                break;
            case 0xA3:
                console.log("Opcode not implemented!");
                break;
            // Move Immediate byte into register (e.g, MOV AL Ib)
            case 0xB0:
                this._regAL = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB1:
                this._regCL = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB2:
                this._regDL = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB3:
                this._regBL = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB4:
                this._regAH = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB5:
                this._regCH = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB6:
                this._regDH = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            case 0xB7:
                this._regBH = this._memoryV[this._regIP + 1];
                this._regIP += 2;
                break;
            // Move Immediate word into register (e.g, MOV AX Ib)
            case 0xB8:
                this._regAH = this._memoryV[this._regIP + 2];
                this._regAL = this._memoryV[this._regIP + 1];
                this._regIP += 3;
                break;
            case 0xB9:
                this._regCH = this._memoryV[this._regIP + 2];
                this._regCL = this._memoryV[this._regIP + 1];
                this._regIP += 3;
                break;
            case 0xBA:
                this._regDH = this._memoryV[this._regIP + 2];
                this._regDL = this._memoryV[this._regIP + 1];
                this._regIP += 3;
                break;
            case 0xBB:
                this._regBH = this._memoryV[this._regIP + 2];
                this._regBL = this._memoryV[this._regIP + 1];
                this._regIP += 3;
                break;
            case 0xBC:
                this._regSP = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);
                this._regIP += 3;
                break;
            case 0xBD:
                this._regBP = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);
                this._regIP += 3;
                break;
            case 0xBE:
                this._regSI = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);
                this._regIP += 3;
                break;
            case 0xBF:
                this._regDI = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);
                this._regIP += 3;
                break;

            /**
             * Instruction : STC
             * Meaning     : Set Carry flag.
             * Notes       :
             */
            case 0xF9:
                this._regFlags |= this.FLAG_CF_MASK;
                this._regIP += 1;
                break;

            /**
             * Instruction : STI
             * Meaning     : Set Interrupt flag.
             * Notes       :
             */
            case 0xFB:
                this._regFlags |= this.FLAG_IF_MASK;
                this._regIP += 1;
                break;

            /**
             * Instruction : STD
             * Meaning     : Set Direction flag.
             * Notes       :
             */
            case 0xFD:
                this._regFlags |= this.FLAG_DF_MASK;
                this._regIP += 1;
                break;

            default :
                console.log("Unknown opcode!");
        }

        // Update timers

        // Debug
        gui.displayRegisters(this._bundleRegisters());
    },

    /**
     * Execute Short Jump (one-byte address)
     * @private
     */
    _shortJump : function ()
    {
        // The jump address a signed (twos complement) offset from the current location.
        var offset = this._memoryV[this._regIP + 1];

        // One-byte twos-complement conversion
        // It seems Javascript does not do ~ (bitwise not) correctly
        offset = ((offset >> 7) === 1) ? (-1 * (offset >> 7)) * ((offset ^ 0xFF) + 1) : offset;

        // We must skip the last byte of this instruction
        this._regIP += (offset + 2);
    },

    /**
     * Generic method to set flags for give operands and result
     *
     * TODO: I think this only works for subtraction, verify for other operations
     *
     * @param operand1
     * @param operand2
     * @param result
     * @param flagsToSet
     * @param size (only used for OF)
     * @private
     */
    _setFlags : function (operand1, operand2, result, flagsToSet, size)
    {
        // Set defaults
        size = size || 'b';

        // Carry Flag (CF)
        // Indicates when an arithmetic carry or borrow has been generated
        // out of the most significant ALU bit position
        if (flagsToSet & this.FLAG_CF_MASK)
        {
            if (operand1 < operand2) this._regFlags |= this.FLAG_CF_MASK;
            else this._regFlags &= ~this.FLAG_CF_MASK;
        }

        // Parity Flag (PF)
        // Indicates if the number of set bits is odd or even in the binary
        // representation of the result of the last operation
        if (flagsToSet & this.FLAG_PF_MASK)
        {
            this._regFlags = this._regFlags | (result & 0x01);
        }

        // Adjust Flag (AF)
        // Indicate when an arithmetic carry or borrow has been generated out
        // of the 4 least significant bits.
        if (flagsToSet & this.FLAG_AF_MASK)
        {
            if ((operand1 & 0x0F) < (operand2 & 0x0F)) this._regFlags |= this.FLAG_AF_MASK;
            else this._regFlags &= ~this.FLAG_AF_MASK;
        }

        // Zero Flag (ZF)
        // Indicates when the result of an arithmetic operation, including
        // bitwise logical instructions is zero, and reset otherwise.
        if (flagsToSet & this.FLAG_ZF_MASK)
        {
            if (0 === result) this._regFlags |= this.FLAG_ZF_MASK;
            else this._regFlags &= ~this.FLAG_ZF_MASK;
        }

        // Sign Flag (SF)
        // Indicate whether the result of the last mathematical operation
        // resulted in a value whose most significant bit was set
        if (flagsToSet & this.FLAG_SF_MASK)
        {
            if (result < 0) this._regFlags |= this.FLAG_SF_MASK;
            else this._regFlags &= ~this.FLAG_SF_MASK;
        }

        // Trap Flag (TF)
        // If the trap flag is set, the 8086 will automatically do a type-1
        // interrupt after each instruction executes. When the 8086 does a
        // type-1 interrupt, it pushes the flag register on the stack.
        if (flagsToSet & this.FLAG_TF_MASK)
        {
            this._regFlags |= this.FLAG_TF_MASK;
        }

        // Interrupt Flag (IF)
        // If the flag is set to 1, maskable hardware interrupts will be
        // handled. If cleared (set to 0), such interrupts will be ignored.
        // IF does not affect the handling of non-maskable interrupts or
        // software interrupts generated by the INT instruction.
        if (flagsToSet & this.FLAG_IF_MASK)
        {
            this._regFlags |= this.FLAG_IF_MASK;
        }

        // Direction Flag (DF)
        // Controls the left-to-right or right-to-left direction of string
        // processing. When it is set to 0 (using the clear-direction-flag
        // instruction CLD),[3] it means that instructions that autoincrement
        // the source index and destination index (like MOVS) will increase
        // both of them. In case it is set to 1 (using the set-direction-flag
        // instruction STD),the instruction will decrease them.
        if (flagsToSet & this.FLAG_DF_MASK)
        {
            this._regFlags |= this.FLAG_DF_MASK;
        }

        // Overflow Flag (OF)
        // Indicates when an arithmetic overflow has occurred in an operation,
        // indicating that the signed two's-complement result would not fit in
        // the number of bits used for the operation (the ALU width).
        if (flagsToSet & this.FLAG_DF_MASK)
        {
            var shift;
            if ('w' === size) shift = 15; else shift = 7;

            if ( 1 === (operand1 >> shift) && 1 === (operand2 >> shift) && 0 === (result >> shift) ||
                0 === (operand1 >> shift) && 0 === (operand2 >> shift) && 1 === (result >> shift))
                this._regFlags = this._regFlags | this.FLAG_OF_MASK;
            else this._regFlags &= ~this.FLAG_OF_MASK;
        }
    },

    _bundleRegisters : function ()
    {
        return {
            AX : ((this._regAH << 8) | this._regAL),
            AH : this._regAH,
            AL : this._regAL,
            BX : ((this._regBH << 8) | this._regBL),
            BH : this._regBH,
            BL : this._regBL,
            CX : ((this._regCH << 8) | this._regCL),
            CH : this._regCH,
            CL : this._regCL,
            DX : ((this._regDH << 8) | this._regDL),
            DH : this._regDH,
            DL : this._regDL,
            SI : this._regSI,
            DI : this._regDI,
            BP : this._regBP,
            SP : this._regSP,
            CS : this._regCS,
            DS : this._regDS,
            ES : this._regES,
            SS : this._regSS,
            IP : this._regIP,
            FLAGS : this._regFlags
        };
    }
}

var oplist = {
    retrieveCode : function (op)
    {
        return this["0x" + (op.toString(16)).toUpperCase()];
    },

    "0x0" : "ADD Eb Gb",
    "0x1" : "ADD Ev Gv",
    "0x2" : "ADD Gb Eb",
    "0x3" : "ADD Gv Ev",
    "0x4" : "ADD AL Ib",
    "0x5" : "ADD eAX Iv",
    "0x6" : "PUSH ES",
    "0x7" : "POP ES",
    "0x8" : "OR Eb Gb",
    "0x9" : "OR Ev Gv",
    "0xA" : "OR Gb Eb",
    "0xB" : "OR Gv Ev",
    "0xC" : "OR AL Ib",
    "0xD" : "OR eAX Iv",
    "0xE" : "PUSH CS",
    "0xF" : "-- Floating point or 286+ op",
    "0x10" : "ADC Eb Gb",
    "0x11" : "ADC Ev Gv",
    "0x12" : "ADC Gb Eb",
    "0x13" : "ADC Gv Ev",
    "0x14" : "ADC AL Ib",
    "0x15" : "ADC eAX Iv",
    "0x16" : "PUSH SS",
    "0x17" : "POP SS",
    "0x18" : "SBB Eb Gb",
    "0x19" : "SBB Ev Gv",
    "0x1A" : "SBB Gb Eb",
    "0x1B" : "SBB Gv Ev",
    "0x1C" : "SBB AL Ib",
    "0x1D" : "SBB eAX Iv",
    "0x1E" : "PUSH DS",
    "0x1F" : "POP DS",
    "0x20" : "AND Eb Gb",
    "0x21" : "AND Ev Gv",
    "0x22" : "AND Gb Eb",
    "0x23" : "AND Gv Ev",
    "0x24" : "AND AL Ib",
    "0x25" : "AND eAX Iv",
    "0x26" : "ES:",
    "0x27" : "DAA",
    "0x28" : "SUB Eb Gb",
    "0x29" : "SUB Ev Gv",
    "0x2A" : "SUB Gb Eb",
    "0x2B" : "SUB Gv Ev",
    "0x2C" : "SUB AL Ib",
    "0x2D" : "SUB eAX Iv",
    "0x2E" : "CS:",
    "0x2F" : "DAS",
    "0x30" : "XOR Eb Gb",
    "0x31" : "XOR Ev Gv",
    "0x32" : "XOR Gb Eb",
    "0x33" : "XOR Gv Ev",
    "0x34" : "XOR AL Ib",
    "0x35" : "XOR eAX Iv",
    "0x36" : "SS:",
    "0x37" : "AAA",
    "0x38" : "CMP Eb Gb",
    "0x39" : "CMP Ev Gv",
    "0x3A" : "CMP Gb Eb",
    "0x3B" : "CMP Gv Ev",
    "0x3C" : "CMP AL Ib",
    "0x3D" : "CMP eAX Iv",
    "0x3E" : "DS:",
    "0x3F" : "AAS",
    "0x40" : "INC eAX",
    "0x41" : "INC eCX",
    "0x42" : "INC eDX",
    "0x43" : "INC eBX",
    "0x44" : "INC eSP",
    "0x45" : "INC eBP",
    "0x46" : "INC eSI",
    "0x47" : "INC eDI",
    "0x48" : "DEC eAX",
    "0x49" : "DEC eCX",
    "0x4A" : "DEC eDX",
    "0x4B" : "DEC eBX",
    "0x4C" : "DEC eSP",
    "0x4D" : "DEC eBP",
    "0x4E" : "DEC eSI",
    "0x4F" : "DEC eDI",
    "0x50" : "PUSH eAX",
    "0x51" : "PUSH eCX",
    "0x52" : "PUSH eDX",
    "0x53" : "PUSH eBX",
    "0x54" : "PUSH eSP",
    "0x55" : "PUSH eBP",
    "0x56" : "PUSH eSI",
    "0x57" : "PUSH eDI",
    "0x58" : "POP eAX",
    "0x59" : "POP eCX",
    "0x5A" : "POP eDX",
    "0x5B" : "POP eBX",
    "0x5C" : "POP eSP",
    "0x5D" : "POP eBP",
    "0x5E" : "POP eSI",
    "0x5F" : "POP eDI",
    "0x70" : "JO Jb",
    "0x71" : "JNO Jb",
    "0x72" : "JB Jb",
    "0x73" : "JNB Jb",
    "0x74" : "JZ Jb",
    "0x75" : "JNZ Jb",
    "0x76" : "JBE Jb",
    "0x77" : "JA Jb",
    "0x78" : "JS Jb",
    "0x79" : "JNS Jb",
    "0x7A" : "JPE Jb",
    "0x7B" : "JPO Jb",
    "0x7C" : "JL Jb",
    "0x7D" : "JGE Jb",
    "0x7E" : "JLE Jb",
    "0x7F" : "JG Jb",
    "0x80" : "GRP1 Eb Ib",
    "0x81" : "GRP1 Ev Iv",
    "0x82" : "GRP1 Eb Ib",
    "0x83" : "GRP1 Ev Ib",
    "0x84" : "TEST Gb Eb",
    "0x85" : "TEST Gv Ev",
    "0x86" : "XCHG Gb Eb",
    "0x87" : "XCHG Gv Ev",
    "0x88" : "MOV Eb Gb",
    "0x89" : "MOV Ev Gv",
    "0x8A" : "MOV Gb Eb",
    "0x8B" : "MOV Gv Ev",
    "0x8C" : "MOV Ew Sw",
    "0x8D" : "LEA Gv M",
    "0x8E" : "MOV Sw Ew",
    "0x8F" : "POP Ev",
    "0x90" : "NOP",
    "0x91" : "XCHG eCX eAX",
    "0x92" : "XCHG eDX eAX",
    "0x93" : "XCHG eBX eAX",
    "0x94" : "XCHG eSP eAX",
    "0x95" : "XCHG eBP eAX",
    "0x96" : "XCHG eSI eAX",
    "0x97" : "XCHG eDI eAX",
    "0x98" : "CBW",
    "0x99" : "CWD",
    "0x9A" : "CALL Ap",
    "0x9B" : "WAIT",
    "0x9C" : "PUSHF",
    "0x9D" : "POPF",
    "0x9E" : "SAHF",
    "0x9F" : "LAHF",
    "0xA0" : "MOV AL Ob",
    "0xA1" : "MOV eAX Ov",
    "0xA2" : "MOV Ob AL",
    "0xA3" : "MOV Ov eAX",
    "0xA4" : "MOVSB",
    "0xA5" : "MOVSW",
    "0xA6" : "CMPSB",
    "0xA7" : "CMPSW",
    "0xA8" : "TEST AL Ib",
    "0xA9" : "TEST eAX Iv",
    "0xAA" : "STOSB",
    "0xAB" : "STOSW",
    "0xAC" : "LODSB",
    "0xAD" : "LODSW",
    "0xAE" : "SCASB",
    "0xAF" : "SCASW",
    "0xB0" : "MOV AL Ib",
    "0xB1" : "MOV CL Ib",
    "0xB2" : "MOV DL Ib",
    "0xB3" : "MOV BL Ib",
    "0xB4" : "MOV AH Ib",
    "0xB5" : "MOV CH Ib",
    "0xB6" : "MOV DH Ib",
    "0xB7" : "MOV BH Ib",
    "0xB8" : "MOV eAX Iv",
    "0xB9" : "MOV eCX Iv",
    "0xBA" : "MOV eDX Iv",
    "0xBB" : "MOV eBX Iv",
    "0xBC" : "MOV eSP Iv",
    "0xBD" : "MOV eBP Iv",
    "0xBE" : "MOV eSI Iv",
    "0xBF" : "MOV eDI Iv",
    "0xC2" : "RET Iw",
    "0xC3" : "RET",
    "0xC4" : "LES Gv Mp",
    "0xC5" : "LDS Gv Mp",
    "0xC6" : "MOV Eb Ib",
    "0xC7" : "MOV Ev Iv",
    "0xCA" : "RETF Iw",
    "0xCB" : "RETF",
    "0xCC" : "INT 3",
    "0xCD" : "INT Ib",
    "0xCE" : "INTO",
    "0xCF" : "IRET",
    "0xD0" : "GRP2 Eb 1",
    "0xD1" : "GRP2 Ev 1",
    "0xD2" : "GRP2 Eb CL",
    "0xD3" : "GRP2 Ev CL",
    "0xD4" : "AAM I0",
    "0xD5" : "AAD I0",
    "0xD7" : "XLAT",
    "0xE0" : "LOOPNZ Jb",
    "0xE1" : "LOOPZ Jb",
    "0xE2" : "LOOP Jb",
    "0xE3" : "JCXZ Jb",
    "0xE4" : "IN AL Ib",
    "0xE5" : "IN eAX Ib",
    "0xE6" : "OUT Ib AL",
    "0xE7" : "OUT Ib eAX",
    "0xE8" : "CALL Jv",
    "0xE9" : "JMP Jv",
    "0xEA" : "JMP Ap",
    "0xEB" : "JMP Jb",
    "0xEC" : "IN AL DX",
    "0xED" : "IN eAX DX",
    "0xEE" : "OUT DX AL",
    "0xEF" : "OUT DX eAX",
    "0xF0" : "LOCK",
    "0xF2" : "REPNZ",
    "0xF3" : "REPZ",
    "0xF4" : "HLT",
    "0xF5" : "CMC",
    "0xF6" : "GRP3a Eb",
    "0xF7" : "GRP3b Ev",
    "0xF8" : "CLC",
    "0xF9" : "STC",
    "0xFA" : "CLI",
    "0xFB" : "STI",
    "0xFC" : "CLD",
    "0xFD" : "STD",
    "0xFE" : "GRP4 Eb",
    "0xFF" : "GRP5 Ev"
}
