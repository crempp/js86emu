var cpu8086 = {
    _opcode  : 0x00,
    _memory  : null,
    _memoryV : null,

    halt     : false,
    
    // Main Registers
    _regAH : 0x00, _regAL : 0x00, // primary accumulator
    _regBH : 0x00, _regBL : 0x00, // base, accumulator
    _regCH : 0x00, _regCL : 0x00, // counter, accumulator
    _regDH : 0x00, _regDL : 0x00, // accumulator, other functions
    
    // Index registers
    _regSI : 0x0000, // Source Index
    _regDI : 0x0000, // Destination Index
    _regBP : 0x0000, // Base Pointer
    _regSP : 0xFFFE, // Stack Pointer
    
    // Program counter
    _regIP : 0x0000, // Instruction Pointer
    
    // Segment registers
    _regCS : 0x0000, // Code Segment
    _regDS : 0x0000, // Data Segment
    _regES : 0x0000, // ExtraSegment
    _regSS : 0x0000, // Stack Segment
    
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
    _regFlags : 0xF000,

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
                case 0: return this._regAL;
                case 1: return this._regCL;
                case 2: return this._regDL;
                case 3: return this._regBL;
                case 4: return this._regAH;
                case 5: return this._regBH;
                case 6: return this._regCH;
                case 7: return this._regDH;
            }
        }
        else if (1 === w)
        {
            switch (reg)
            {
                case 0: return ((this._regAH << 8) | this._regAL);
                case 1: return ((this._regCH << 8) | this._regCL);
                case 2: return ((this._regDH << 8) | this._regDL);
                case 3: return ((this._regBH << 8) | this._regBL);
                case 4: return this._regSP;
                case 5: return this._regBP;
                case 6: return this._regSI;
                case 7: return this._regDI;
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
                case 0: this._regAL = value;
                case 1: this._regCL = value;
                case 2: this._regDL = value;
                case 3: this._regBL = value;
                case 4: this._regAH = value;
                case 5: this._regBH = value;
                case 6: this._regCH = value;
                case 7: this._regDH = value;
            }
        }
        else if (1 === w)
        {
            switch (reg)
            {
                case 0: this._regAH = (value >>> 8); this._regAL = (value & 0xFF);
                case 1: this._regCH = (value >>> 8); this._regCL = (value & 0xFF);
                case 2: this._regDH = (value >>> 8); this._regDL = (value & 0xFF);
                case 3: this._regBH = (value >>> 8); this._regBL = (value & 0xFF);
                case 4: this._regSP = value;
                case 5: this._regBP = value;
                case 6: this._regSI = value;
                case 7: this._regDI = value;
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
        this._regSP = 0xFFFE;

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

        var flag = 0x00;

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

        if (cpu.isDebug()) cpu.printOpcodeDebug(opcode_byte, addressing_byte, opcode);

        //====Execute Opcode====
        switch (opcode_byte)
        {
            case 0x0F :
                var opcode_byte_2 = this._memoryV[this._regIP + 1];
                console.log("Two-byte opcode - not supported! [" + opcode_byte_2.toString(16) + "]");
                break;

            /**
             * Instruction : JZ
             * Meaning     : Short Jump if Zero (equal).
             * Notes       : Set by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.
             * Opcode      : 0x74
             */
            case 0x74:
                if (this._regFlags & this.FLAG_ZF_MASK)
                {
                    this._regIP = this._memoryV[this._regIP + 1];
                }
                else
                {
                    this._regIP += 2;
                }
                break;

            /**
             * Instruction : GRP1
             * Meaning     : Group Opcode 1
             * Notes       :
             * Opcode      :
             */
            case 0x81:
                // Do stuff
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
                     * Opcode      : 0x81
                     */
                    case 7 :
                        valDst = this._getRegValueForOp(opcode.w, opcode.reg);
                        valSrc = ((this._memoryV[this._regIP + 3] << 8) | this._memoryV[this._regIP + 2]);

                        this._op_CMP(valDst, valSrc);

                        this._regIP += 4;

                        break;
                    default :
                        console.log("Invalid opcode!");
                }
                break;
            /**
             * Instruction : HLT
             * Meaning     : Halt the System
             * Notes       :
             * Opcode      : 0xF4
             */
            case 0xF4:
                this.halt = true;
                break;
            default :
                console.log("Unknown opcode!");
        }

        // Update timers


        console.log(
            "--------------------------------------------------------------------[registers]\n" +
            "  AX: 0x" + ((this._regAH << 8) | this._regAL).toString(16) + "  BX: 0x" + ((this._regBH << 8) | this._regBL).toString(16) + "  CX: 0x" + ((this._regCH << 8) | this._regCL).toString(16) + "  DX: 0x" + ((this._regDH << 8) | this._regDL).toString(16) + "\n" +
            "  SI: 0x" + this._regSI.toString(16) + "  DI: 0x" + this._regDI.toString(16) + "  BP: 0x" + this._regBP.toString(16) + "  SP: 0x" + this._regSP.toString(16) + "\n" +
            "  CS: 0x" + this._regCS.toString(16) + "  DS: 0x" + this._regDS.toString(16) + "  ES: 0x" + this._regES.toString(16) + "  SS: 0x" + this._regSS.toString(16) + "\n" +
            "  IP: 0x" + this._regIP + "  FLAGS : 0x" + this._regFlags.toString(16) + " [" + this._regFlags.toString(2) + "]"
        );
    },

     _op_CMP : function (v1, v2)
    {
        // this is two-byte (word) subtraction
        var valResult = v1 - v2;

        console.log("v1=" + v1.toString(16));
        console.log("v2=" + v2.toString(16));
        console.log("valResult=" + valResult.toString(16));

        // Set flags
        if (v1 < v2) this._regFlags = this._regFlags | this.FLAG_CF_MASK;                   // Set CF
        this._regFlags = this._regFlags | (valResult & 0x01);                               // Set PF
        if ((v1 & 0x0F) < (v2 & 0x0F)) this._regFlags = this._regFlags | this.FLAG_AF_MASK; // Set AF
        if (0 === valResult) this._regFlags = this._regFlags | this.FLAG_ZF_MASK;           // Set ZF
        if (valResult < 0) this._regFlags = this._regFlags | this.FLAG_SF_MASK;             // Set SF
        // Don't set trap flag (TF)
        // Don't set interupt flag (IF)
        // Don't set direction flag (DF)

        // Set OF
        if ( 1 === (v1 >> 15) && 1 === (v2 >> 15) && 0 === (valResult >> 15) ||
             0 === (v1 >> 15) && 0 === (v2 >> 15) && 1 === (valResult >> 15))
            this._regFlags = this._regFlags | this.FLAG_OF_MASK;
    }
}

var oplist = {
    retrieveCode : function (op)
    {
        return this["0x" + (op.toString(16)).toUpperCase()];
    },

    "0x0" : "00 ADD Eb Gb",
    "0x1" : "01 ADD Ev Gv",
    "0x2" : "02 ADD Gb Eb",
    "0x3" : "03 ADD Gv Ev",
    "0x4" : "04 ADD AL Ib",
    "0x5" : "05 ADD eAX Iv",
    "0x6" : "06 PUSH ES",
    "0x7" : "07 POP ES",
    "0x8" : "08 OR Eb Gb",
    "0x9" : "09 OR Ev Gv",
    "0xA" : "0A OR Gb Eb",
    "0xB" : "0B OR Gv Ev",
    "0xC" : "0C OR AL Ib",
    "0xD" : "0D OR eAX Iv",
    "0xE" : "0E PUSH CS",
    "0xF" : "0F -- Floating point or 286+ op",
    "0x10" : "10 ADC Eb Gb",
    "0x11" : "11 ADC Ev Gv",
    "0x12" : "12 ADC Gb Eb",
    "0x13" : "13 ADC Gv Ev",
    "0x14" : "14 ADC AL Ib",
    "0x15" : "15 ADC eAX Iv",
    "0x16" : "16 PUSH SS",
    "0x17" : "17 POP SS",
    "0x18" : "18 SBB Eb Gb",
    "0x19" : "19 SBB Ev Gv",
    "0x1A" : "1A SBB Gb Eb",
    "0x1B" : "1B SBB Gv Ev",
    "0x1C" : "1C SBB AL Ib",
    "0x1D" : "1D SBB eAX Iv",
    "0x1E" : "1E PUSH DS",
    "0x1F" : "1F POP DS",
    "0x20" : "20 AND Eb Gb",
    "0x21" : "21 AND Ev Gv",
    "0x22" : "22 AND Gb Eb",
    "0x23" : "23 AND Gv Ev",
    "0x24" : "24 AND AL Ib",
    "0x25" : "25 AND eAX Iv",
    "0x26" : "26 ES:",
    "0x27" : "27 DAA",
    "0x28" : "28 SUB Eb Gb",
    "0x29" : "29 SUB Ev Gv",
    "0x2A" : "2A SUB Gb Eb",
    "0x2B" : "2B SUB Gv Ev",
    "0x2C" : "2C SUB AL Ib",
    "0x2D" : "2D SUB eAX Iv",
    "0x2E" : "2E CS:",
    "0x2F" : "2F DAS",
    "0x30" : "30 XOR Eb Gb",
    "0x31" : "31 XOR Ev Gv",
    "0x32" : "32 XOR Gb Eb",
    "0x33" : "33 XOR Gv Ev",
    "0x34" : "34 XOR AL Ib",
    "0x35" : "35 XOR eAX Iv",
    "0x36" : "36 SS:",
    "0x37" : "37 AAA",
    "0x38" : "38 CMP Eb Gb",
    "0x39" : "39 CMP Ev Gv",
    "0x3A" : "3A CMP Gb Eb",
    "0x3B" : "3B CMP Gv Ev",
    "0x3C" : "3C CMP AL Ib",
    "0x3D" : "3D CMP eAX Iv",
    "0x3E" : "3E DS:",
    "0x3F" : "3F AAS",
    "0x40" : "40 INC eAX",
    "0x41" : "41 INC eCX",
    "0x42" : "42 INC eDX",
    "0x43" : "43 INC eBX",
    "0x44" : "44 INC eSP",
    "0x45" : "45 INC eBP",
    "0x46" : "46 INC eSI",
    "0x47" : "47 INC eDI",
    "0x48" : "48 DEC eAX",
    "0x49" : "49 DEC eCX",
    "0x4A" : "4A DEC eDX",
    "0x4B" : "4B DEC eBX",
    "0x4C" : "4C DEC eSP",
    "0x4D" : "4D DEC eBP",
    "0x4E" : "4E DEC eSI",
    "0x4F" : "4F DEC eDI",
    "0x50" : "50 PUSH eAX",
    "0x51" : "51 PUSH eCX",
    "0x52" : "52 PUSH eDX",
    "0x53" : "53 PUSH eBX",
    "0x54" : "54 PUSH eSP",
    "0x55" : "55 PUSH eBP",
    "0x56" : "56 PUSH eSI",
    "0x57" : "57 PUSH eDI",
    "0x58" : "58 POP eAX",
    "0x59" : "59 POP eCX",
    "0x5A" : "5A POP eDX",
    "0x5B" : "5B POP eBX",
    "0x5C" : "5C POP eSP",
    "0x5D" : "5D POP eBP",
    "0x5E" : "5E POP eSI",
    "0x5F" : "5F POP eDI",
    "0x70" : "70 JO Jb",
    "0x71" : "71 JNO Jb",
    "0x72" : "72 JB Jb",
    "0x73" : "73 JNB Jb",
    "0x74" : "74 JZ Jb",
    "0x75" : "75 JNZ Jb",
    "0x76" : "76 JBE Jb",
    "0x77" : "77 JA Jb",
    "0x78" : "78 JS Jb",
    "0x79" : "79 JNS Jb",
    "0x7A" : "7A JPE Jb",
    "0x7B" : "7B JPO Jb",
    "0x7C" : "7C JL Jb",
    "0x7D" : "7D JGE Jb",
    "0x7E" : "7E JLE Jb",
    "0x7F" : "7F JG Jb",
    "0x80" : "80 GRP1 Eb Ib",
    "0x81" : "81 GRP1 Ev Iv",
    "0x82" : "82 GRP1 Eb Ib",
    "0x83" : "83 GRP1 Ev Ib",
    "0x84" : "84 TEST Gb Eb",
    "0x85" : "85 TEST Gv Ev",
    "0x86" : "86 XCHG Gb Eb",
    "0x87" : "87 XCHG Gv Ev",
    "0x88" : "88 MOV Eb Gb",
    "0x89" : "89 MOV Ev Gv",
    "0x8A" : "8A MOV Gb Eb",
    "0x8B" : "8B MOV Gv Ev",
    "0x8C" : "8C MOV Ew Sw",
    "0x8D" : "8D LEA Gv M",
    "0x8E" : "8E MOV Sw Ew",
    "0x8F" : "8F POP Ev",
    "0x90" : "90 NOP",
    "0x91" : "91 XCHG eCX eAX",
    "0x92" : "92 XCHG eDX eAX",
    "0x93" : "93 XCHG eBX eAX",
    "0x94" : "94 XCHG eSP eAX",
    "0x95" : "95 XCHG eBP eAX",
    "0x96" : "96 XCHG eSI eAX",
    "0x97" : "97 XCHG eDI eAX",
    "0x98" : "98 CBW",
    "0x99" : "99 CWD",
    "0x9A" : "9A CALL Ap",
    "0x9B" : "9B WAIT",
    "0x9C" : "9C PUSHF",
    "0x9D" : "9D POPF",
    "0x9E" : "9E SAHF",
    "0x9F" : "9F LAHF",
    "0xA0" : "A0 MOV AL Ob",
    "0xA1" : "A1 MOV eAX Ov",
    "0xA2" : "A2 MOV Ob AL",
    "0xA3" : "A3 MOV Ov eAX",
    "0xA4" : "A4 MOVSB",
    "0xA5" : "A5 MOVSW",
    "0xA6" : "A6 CMPSB",
    "0xA7" : "A7 CMPSW",
    "0xA8" : "A8 TEST AL Ib",
    "0xA9" : "A9 TEST eAX Iv",
    "0xAA" : "AA STOSB",
    "0xAB" : "AB STOSW",
    "0xAC" : "AC LODSB",
    "0xAD" : "AD LODSW",
    "0xAE" : "AE SCASB",
    "0xAF" : "AF SCASW",
    "0xB0" : "B0 MOV AL Ib",
    "0xB1" : "B1 MOV CL Ib",
    "0xB2" : "B2 MOV DL Ib",
    "0xB3" : "B3 MOV BL Ib",
    "0xB4" : "B4 MOV AH Ib",
    "0xB5" : "B5 MOV CH Ib",
    "0xB6" : "B6 MOV DH Ib",
    "0xB7" : "B7 MOV BH Ib",
    "0xB8" : "B8 MOV eAX Iv",
    "0xB9" : "B9 MOV eCX Iv",
    "0xBA" : "BA MOV eDX Iv",
    "0xBB" : "BB MOV eBX Iv",
    "0xBC" : "BC MOV eSP Iv",
    "0xBD" : "BD MOV eBP Iv",
    "0xBE" : "BE MOV eSI Iv",
    "0xBF" : "BF MOV eDI Iv",
    "0xC2" : "C2 RET Iw",
    "0xC3" : "C3 RET",
    "0xC4" : "C4 LES Gv Mp",
    "0xC5" : "C5 LDS Gv Mp",
    "0xC6" : "C6 MOV Eb Ib",
    "0xC7" : "C7 MOV Ev Iv",
    "0xCA" : "CA RETF Iw",
    "0xCB" : "CB RETF",
    "0xCC" : "CC INT 3",
    "0xCD" : "CD INT Ib",
    "0xCE" : "CE INTO",
    "0xCF" : "CF IRET",
    "0xD0" : "D0 GRP2 Eb 1",
    "0xD1" : "D1 GRP2 Ev 1",
    "0xD2" : "D2 GRP2 Eb CL",
    "0xD3" : "D3 GRP2 Ev CL",
    "0xD4" : "D4 AAM I0",
    "0xD5" : "D5 AAD I0",
    "0xD7" : "D7 XLAT",
    "0xE0" : "E0 LOOPNZ Jb",
    "0xE1" : "E1 LOOPZ Jb",
    "0xE2" : "E2 LOOP Jb",
    "0xE3" : "E3 JCXZ Jb",
    "0xE4" : "E4 IN AL Ib",
    "0xE5" : "E5 IN eAX Ib",
    "0xE6" : "E6 OUT Ib AL",
    "0xE7" : "E7 OUT Ib eAX",
    "0xE8" : "E8 CALL Jv",
    "0xE9" : "E9 JMP Jv",
    "0xEA" : "EA JMP Ap",
    "0xEB" : "EB JMP Jb",
    "0xEC" : "EC IN AL DX",
    "0xED" : "ED IN eAX DX",
    "0xEE" : "EE OUT DX AL",
    "0xEF" : "EF OUT DX eAX",
    "0xF0" : "F0 LOCK",
    "0xF2" : "F2 REPNZ",
    "0xF3" : "F3 REPZ",
    "0xF4" : "F4 HLT",
    "0xF5" : "F5 CMC",
    "0xF6" : "F6 GRP3a Eb",
    "0xF7" : "F7 GRP3b Ev",
    "0xF8" : "F8 CLC",
    "0xF9" : "F9 STC",
    "0xFA" : "FA CLI",
    "0xFB" : "FB STI",
    "0xFC" : "FC CLD",
    "0xFD" : "FD STD",
    "0xFE" : "FE GRP4 Eb",
    "0xFF" : "FF GRP5 Ev"
}
