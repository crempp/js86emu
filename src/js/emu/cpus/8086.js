/**
 *
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */
define([
    "gui/models/SettingsModel"
],
function(
    SettingsModel
)
{
    _Cpu = null;

    _breakOnError = false;

    var Cpu8086 = {
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
         * @param opcode
         * @private
         */
        _getRegValueForOp : function (opcode) {
            if (0 === opcode.w)
            {
                switch (opcode.reg)
                {
                    case 0:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register AL (byte)");
                        this._regIP += 1;
                        return this._regAL;
                    case 1:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register CL (byte)");
                        this._regIP += 1;
                        return this._regCL;
                    case 2:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register DL (byte)");
                        this._regIP += 1;
                        return this._regDL;
                    case 3:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register BL (byte)");
                        this._regIP += 1;
                        return this._regBL;
                    case 4:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register AH (byte)");
                        this._regIP += 1;
                        return this._regAH;
                    case 5:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register BH (byte)");
                        this._regIP += 1;
                        return this._regBH;
                    case 6:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register CH (byte)");
                        this._regIP += 1;
                        return this._regCH;
                    case 7:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register DH (byte)");
                        this._regIP += 1;
                        return this._regDH;
                    default:
                        throw "Invalid reg table lookup parameters";
                }
            }
            else if (1 === opcode.w)
            {
                switch (opcode.reg)
                {
                    case 0:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register AX (word)");
                        this._regIP += 1;
                        return ((this._regAH << 8) | this._regAL);
                    case 1:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register CX (word)");
                        this._regIP += 1;
                        return ((this._regCH << 8) | this._regCL);
                    case 2:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register DX (word)");
                        this._regIP += 1;
                        return ((this._regDH << 8) | this._regDL);
                    case 3:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register BX (word)");
                        this._regIP += 1;
                        return ((this._regBH << 8) | this._regBL);
                    case 4:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register SP (word)");
                        this._regIP += 1;
                        return this._regSP;
                    case 5:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register BP (word)");
                        this._regIP += 1;
                        return this._regBP;
                    case 6:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register SI (word)");
                        this._regIP += 1;
                        return this._regSI;
                    case 7:
                        //if (_Cpu.isDebug()) console.log("_getRegValueForOp() - Using register DI (word)");
                        this._regIP += 1;
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

        _getRMValueForOp : function (opcode, operandValue)
        {
            var addr;

            // Use R/M Table 1 with no displacement
            if (0 === opcode.mod)
            {
                switch (opcode.rm)
                {
                    case 0 :
                        // [BX + SI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BX + SI] to retrieve mem (word)");
                        addr = ( ((this._regBH << 8) | this._regBL) + this._regSI );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                    case 1 :
                        // [BX + DI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BX + DI] to retrieve mem (word)");
                        addr = ( ((this._regBH << 8) | this._regBL) + this._regDI );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                    case 2 :
                        // [BP + SI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BP + SI] to retrieve mem (word)");
                        addr = ( this._regBP + this._regSI );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                    case 3 :
                        // [BP + DI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BP + DI] to retrieve mem (word)");
                        addr = ( this._regBP + this._regDI );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                    case 4 :
                        // [SI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [SI] to retrieve mem (word)");
                        addr = ( this._regSI );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                    case 5 :
                        // [DI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [DI] to retrieve mem (word)");
                        addr = ( this._regDI );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                    case 6 :
                        // Drc't Add
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using Drc't Add to retrieve mem (word)");
                        this._regIP += 2;
                        return ((this._memoryV[operandValue + 1] << 8) | this._memoryV[operandValue]);
                        break;
                    case 7 :
                        // [BX]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BX] to retrieve mem (word)");
                        addr = ( (this._regBH << 8) | this._regBL );
                        this._regIP += 1;
                        return ((this._memoryV[addr + 1] << 8) | this._memoryV[addr]);
                        break;
                }
            }
            // Use R/M Table 2 with 8-bit signed displacement
            else if (1 === opcode.mod || 2 == opcode.mod)
            {
                // Add DISP to register specified
                switch (opcode.rm)
                {
                    case 0 :
                        // [BX + SI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BX + SI] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 1 :
                        // [BX + DI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BX + DI] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 2 :
                        // [BP + SI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BP + SI] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 3 :
                        // [BP + DI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BP + DI] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 4 :
                        // [SI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [SI] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 5 :
                        // [DI]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [DI] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 6 :
                        // [BP]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BP] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 7 :
                        // [BX]
                        //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - Using [BX] + Disp to retrieve mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                }
            }
            // R/M bits refer to REG tables
            else if (3 === opcode.mod)
            {
                //if (_Cpu.isDebug()) console.log("_getRMValueForOp() - deffering to _getRegValueForOp()");
                // Modifiy opcode object so reg is now rm. This way we can use existing
                // _getRegValueForOp() method

                // The following helper will increase the IP so we don't have to here
                return this._getRegValueForOp({w:opcode.w, d:opcode.d, reg:opcode.rm, rm:opcode.rm});
            }
            else
            {
                throw "Invalid r/m table lookup parameters";
            }
            return 0;
        },

        /**
         * Looks up the correct register to use based on the w and reg
         * values in the opcode.
         *
         * Sets the register to the given value
         *
         * @param opcode
         * @param value
         * @private
         */
        _setRegValueForOp : function (opcode, value) {
            if (0 === opcode.w)
            {
                this._regIP += 1;
                switch (opcode.reg)
                {
                    case 0:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register AL (byte)");
                        this._regAL = value;
                        break;
                    case 1:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register CL (byte)");
                        this._regCL = value;
                        break;
                    case 2:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register DL (byte)");
                        this._regDL = value;
                        break;
                    case 3:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register BL (byte)");
                        this._regBL = value;
                        break;
                    case 4:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register AH (byte)");
                        this._regAH = value;
                        break;
                    case 5:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register BH (byte)");
                        this._regBH = value;
                        break;
                    case 6:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register CH (byte)");
                        this._regCH = value;
                        break;
                    case 7:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register DH (byte)");
                        this._regDH = value;
                        break;
                }
            }
            else if (1 === opcode.w)
            {
                this._regIP += 1;
                switch (opcode.reg)
                {
                    case 0:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register AX (word)");
                        this._regAH = (value >>> 8); this._regAL = (value & 0xFF);
                        break;
                    case 1:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register CX (word)");
                        this._regCH = (value >>> 8); this._regCL = (value & 0xFF);
                        break;
                    case 2:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register DX (word)");
                        this._regDH = (value >>> 8); this._regDL = (value & 0xFF);
                        break;
                    case 3:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register BX (word)");
                        this._regBH = (value >>> 8); this._regBL = (value & 0xFF);
                        break;
                    case 4:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register SP (word)");
                        this._regSP = value; break;
                    case 5:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register BP (word)");
                        this._regBP = value; break;
                    case 6:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register SI (word)");
                        this._regSI = value; break;
                    case 7:
                        //if (_Cpu.isDebug()) console.log("_setRegValueForOp() - Setting register DI (word)");
                        this._regDI = value; break;
                }
            }
            else
            {
                throw "Invalid reg table lookup parameters";
            }
        },

        _setRMValueForOp : function (opcode, value)
        {
            var addr, val;

            if (0 === opcode.mod)
            {
                switch (opcode.rm)
                {
                    case 0 : // 000b
                        // [BX + SI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BX + SI] to set mem (word)");

                        addr = ( ((this._regBH << 8) | this._regBL) + this._regSI );

                        if (0 === opcode.d) // Dest specified by REG field
                        {
                            // Logic for Byte and Word sizes are the same
                            this._setRegValueForOp(opcode, addr);

                            // Correct for duplicate helper usage
                            this._regIP -= 1;
                        }
                        else // Dest specified by R/M field
                        {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }

                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
                        }

                        this._regIP += 1;

                        break;
                    case 1 : // 001b
                        // [BX + DI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BX + DI] to set mem (word)");

                        addr = ( ((this._regBH << 8) | this._regBL) + this._regDI );

    //                    if (0 === opcode.d) // Dest specified by REG field
    //                    {
    //                        // Logic for Byte and Word sizes are the same
    //                        this._setRegValueForOp(opcode, addr);
    //                    }
    //                    else // Dest specified by R/M field
    //                    {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }
                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
    //                    }

                        this._regIP += 1;

                        break;
                    case 2 : // 010b
                        // [BP + SI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BP + SI] to set mem (word)");

                        addr = ( this._regBP + this._regSI );

                        if (0 === opcode.d) // Dest specified by REG field
                        {
                            // Logic for Byte and Word sizes are the same
                            this._setRegValueForOp(opcode, addr);
                        }
                        else // Dest specified by R/M field
                        {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }

                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
                        }

                        this._regIP += 1;

                        break;
                    case 3 : // 011b
                        // [BP + DI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BP + DI] to set mem (word)");

                        addr = ( this._regBP + this._regDI );

                        if (0 === opcode.d) // Dest specified by REG field
                        {
                            // Logic for Byte and Word sizes are the same
                            this._setRegValueForOp(opcode, addr);
                        }
                        else // Dest specified by R/M field
                        {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }

                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
                        }

                        this._regIP += 1;

                        break;
                    case 4 : // 100b
                        // [SI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [SI] to set mem (word)");

                        addr = ( this._regSI );

                        if (0 === opcode.d) // Dest specified by REG field
                        {
                            // Logic for Byte and Word sizes are the same
                            this._setRegValueForOp(opcode, addr);
                        }
                        else // Dest specified by R/M field
                        {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }

                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
                        }

                        this._regIP += 1;

                        break;
                    case 5 : // 101b
                        // [DI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [DI] to set mem (word)");

                        addr = ( this._regDI );

                        if (0 === opcode.d) // Dest specified by REG field
                        {
                            // Logic for Byte and Word sizes are the same
                            this._setRegValueForOp(opcode, addr);
                        }
                        else // Dest specified by R/M field
                        {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }

                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
                        }

                        this._regIP += 1;

                        break;
                    case 6 : // 110b
                        // Drc't Add
                        if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using Drc't Add to set mem (word)");

                        if ('undefined' === typeof value)
                        {
                            value = this._getRegValueForOp(opcode);

                            // Correct for duplicate helper usage
                            this._regIP -= 1;
                        }

                        if (0 === opcode.w) // Byte
                        {
                            addr = this._memoryV[this._regIP + 2];

                            this._memoryV[addr] = (value & 0x00FF);

                            this._regIP += 2;
                        }
                        else // Word
                        {
                            var addr = ( (this._memoryV[this._regIP + 3] << 8) | this._memoryV[this._regIP + 2] );

                            this._memoryV[addr]     = (value & 0x00FF);
                            this._memoryV[addr + 1] = ((value >> 8) & 0x00FF);

                            this._regIP += 3;
                        }
                        break;
                    case 7 : // 111b
                        // [BX]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BX] to set mem (word)");

                        addr = ( (this._regBH << 8) | this._regBL );

                        if (0 === opcode.d) // Dest specified by REG field
                        {
                            // Logic for Byte and Word sizes are the same
                            this._setRegValueForOp(opcode, addr);
                            // Correct for duplicate helper usage
                            this._regIP -= 1;
                        }
                        else // Dest specified by R/M field
                        {
                            if ('undefined' === typeof value)
                            {
                                value = this._getRegValueForOp(opcode);
                                // Correct for duplicate helper usage
                                this._regIP -= 1;
                            }

                            if (0 === opcode.w) // Byte
                            {
                                this._memoryV[addr] = (value & 0x00FF);
                            }
                            else // Word
                            {
                                this._memoryV[addr]     = ((value >> 8) & 0x00FF);
                                this._memoryV[addr + 1] = (value & 0x00FF);
                            }
                        }

                        this._regIP += 1;

                        break;
                }
            }
            else if (1 === opcode.mod || 2 == opcode.mod)
            {
                // Add DISP to register specified
                switch (opcode.rm)
                {
                    case 0 :
                        // [BX + SI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BX + SI] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                    case 1 :
                        // [BX + DI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BX + DI] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                    case 2 :
                        // [BP + SI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BP + SI] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                    case 3 :
                        // [BP + DI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BP + DI] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                    case 4 :
                        // [SI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [SI] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                    case 5 :
                        // [DI]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [DI] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        return 0;
                        break;
                    case 6 :
                        // [BP]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BP] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                    case 7 :
                        // [BX]
                        //if (_Cpu.isDebug()) console.log("_setRMValueForOp() - Using [BX] + Disp to set mem (word)");
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "RM Lookup not implemented for these parameters",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        this._regIP += 1;

                        break;
                }
            }
            // R/M bits refer to REG tables
            else if (3 === opcode.mod)
            {
                // Modifiy opcode object so reg is now rm. This way we can use existing
                // _getRegValueForOp() method
                this._setRegValueForOp(
                    {w:opcode.w, d:opcode.d, reg:opcode.rm, rm:opcode.rm},
                    value
                );
            }
            else
            {
                throw "Invalid r/m table lookup parameters";
            }
        },

        /**
         * Reset the CPU state
         *
         * TODO: Verify this information
         * The video RAM starts at address 8000h,
         *
         * (from http://www.cpu-world.com/Arch/8086.html)
         *
         * Program memory - program can be located anywhere in memory. Jump and
         * call instructions can be used for short jumps within currently selected
         * 64 KB code segment, as well as for far jumps anywhere within 1 MB of
         * memory. All conditional jump instructions can be used to jump within
         * approximately +127 - -127 bytes from current instruction.
         *
         * Data memory - the 8086 processor can access data in any one out of 4
         * available segments, which limits the size of accessible memory to 256 KB
         * (if all four segments point to different 64 KB blocks). Accessing data
         * from the Data, Code, Stack or Extra segments can be usually done by
         * prefixing instructions with the DS:, CS:, SS: or ES: (some registers and
         * instructions by default may use the ES or SS segments instead of DS
         * segment).
         *
         * Word data can be located at odd or even byte boundaries. The processor
         * uses two memory accesses to read 16-bit word located at odd byte
         * boundaries. Reading word data from even byte boundaries requires only
         * one memory access.
         *
         * Stack memory can be placed anywhere in memory. The stack can be located
         * at odd memory addresses, but it is not recommended for performance
         * reasons (see "Data Memory" above).
         *
         * Reserved locations:
         *
         * 0000h - 03FFh are reserved for interrupt vectors. Each interrupt vector
         * is a 32-bit pointer in format segment:offset.
         *
         * FFFF0h - FFFFFh - after RESET the processor always starts program
         * execution at the FFFF0h address.
         */
        reset : function (Cpu, settings)
        {
            _Cpu = Cpu;

            _breakOnError = SettingsModel.get("emuSettings").breakOnError;

            this.halt = false;

            // Initialize registers and memory once
            this._opcode = 0x00;

            this._memory  = new ArrayBuffer(1048576); // 1,048,576 bytes (1MB)
            this._memoryV = new Uint8Array(this._memory);

            // Zero memory
            for (var i = 0; i < this._memoryV.length; i++)
            {
                this._memoryV[i] = 0;
            }

            // Main Registers
            this._regAH = settings['cpu-init']['registers']['ah'];
            this._regAL = 0x00;
            this._regBH = 0x00;
            this._regBL = 0x00;
            this._regCH = 0x00;
            this._regCL = 0x00;
            this._regDH = 0x00;
            this._regDL = 0x00;

            this._regSI = 0x0000;
            this._regDI = 0x0000;
            this._regBP = 0x0000;
            this._regSP = settings['cpu-init']['registers']['sp'];

            // Program counter
            this._regIP = settings['cpu-init']['registers']['ip'];

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
            var av = new Uint8Array(blob);
            this._memoryV.set(av, addr);
        },

        /**
         *
         */
        emulateCycle : function ()
        {
            // Some common variables
            var valSrc, valDst, valResult, regX;

            // Fetch Opcode
            var opcode_byte     = this._memoryV[this._regIP];
            var addressing_byte = this._memoryV[this._regIP + 1];

            //====Decode Opcode====
            var opcode = {
                opcode_byte : opcode_byte,
                addressing_byte : addressing_byte,
                prefix : 0x00, // Not supporting prefix opcodes yet
                opcode : (opcode_byte & 0xFC) >>> 2,
                d      : (opcode_byte & 0x02) >>> 1,
                w      : (opcode_byte & 0x01),
                mod    : (addressing_byte & 0xC0) >>> 6,
                reg    : (addressing_byte & 0x38) >>> 3,
                rm     : (addressing_byte & 0x07)
            };

            // Pre-cycle Debug
            if (_Cpu.isDebug())
            {
                _Cpu.debugUpdateDecode(opcode);
                _Cpu.debugUpdateMemory(this._memoryV);
            }

            //====Execute Opcode====
            switch (opcode_byte)
            {
                /**
                 * Two-byte instructions
                 */
                case 0x0F :
                    var opcode_byte_2 = this._memoryV[this._regIP + 1];
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Two-byte opcode - not supported! [" + opcode_byte_2.toString(16) + "]",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;

                /**
                 * Instruction : ADC
                 * Meaning     : Add with carry
                 * Notes       : Sums the two operands, if CF is set adds one to the result
                 */
                case 0x10 :
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst + valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                    // Set clamped byte
                    this._setRMValueForOp(opcode, (valResult & 0x00FF));

                    // correct for duplicate helper usage
                    this._regIP -= 4; // This seems wonky but it works for the moment

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x11 :
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst + valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                    // Set clamped word
                    this._setRMValueForOp(opcode, (valResult & 0xFFFF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x12 :
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst + valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                    // Set clamped byte
                    this._setRMValueForOp(opcode, (valResult & 0x00FF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x13 :
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst + valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                    // Set clamped word
                    this._setRMValueForOp(opcode, (valResult & 0xFFFF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x14 :
                    valDst = this._regAL;
                    valSrc = this._memoryV[this._regIP + 1];

                    valResult = valDst + valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                    // Set clamped byte
                    this._setRMValueForOp(opcode, (valResult & 0x00FF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x15 :
                    valDst = ((this._regAH << 8) | this._regAL);
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst + valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                    // Set clamped word
                    this._setRMValueForOp(opcode, (valResult & 0xFFFF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                /**
                 * Instruction : ADD
                 * Meaning     : Add src to dst replacing the original contents
                 *               of dest
                 * Notes       :
                 */
                case 0x00:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst + valSrc;

                    this._setRMValueForOp(opcode, valResult & 0x00FF);

                    // correct for duplicate helper usage
                    this._regIP -= 4; // This seems wonky but it works for the moment

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x01:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst + valSrc;

                    this._setRMValueForOp(opcode, valResult & 0xFFFF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x02:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst + valSrc;

                    this._setRegValueForOp(opcode, valResult & 0x00FF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x03:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst + valSrc;

                    this._setRMValueForOp(opcode, valResult & 0xFFFF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                case 0x04:
                    valDst = this._regAL;
                    valSrc = this._memoryV[this._regIP + 1];

                    valResult = valDst + valSrc;

                    this._regAL = valResult & 0x00FF;

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
                        "b",
                        "add");

                    this._regIP += 2;

                    break;
                case 0x05:
                    valDst = ((this._regAH << 8) | this._regAL);
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst + valSrc;

                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                /**
                 * Instruction : AND
                 * Meaning     : Logical and
                 * Notes       :
                 */
                case 0x20:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst & valSrc;

                    this._setRMValueForOp(opcode, valResult & 0x00FF);

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x21:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst & valSrc;

                    this._setRMValueForOp(opcode, valResult & 0xFFFF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x22:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst & valSrc;

                    this._setRegValueForOp(opcode, valResult & 0x00FF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x23:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst & valSrc;

                    this._setRMValueForOp(opcode, valResult & 0xFFFF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                case 0x24:
                    valDst = this._regAL;
                    valSrc = this._memoryV[this._regIP + 1];

                    valResult = valDst & valSrc;

                    this._regAL = valResult & 0x00FF;

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
                        "b",
                        "add");

                    this._regIP += 2;

                    break;
                case 0x25:
                    valDst = ((this._regAH << 8) | this._regAL);
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst & valSrc;

                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                /**
                 * Instruction : CALL
                 * Meaning     : Transfers control to procedure, return address is
                 *              (IP) is pushed to stack.
                 * Notes       :
                 */
                case 0xE8:
                    var thisOpLen = 3;

                    // Push return address
                    // The return address is the _NEXT_ instruction, not the current
                    this._push(this._regIP + thisOpLen);

                    // Jump to procedure
                    // The relative address starts from the _END_ of this op
                    this._regIP += ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]) + thisOpLen;

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
                 * Instruction : CMP
                 * Meaning     :
                 * Notes       :
                 */
                case 0x38:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    // correct for duplicate helper usage
                    this._regIP -= 1;

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
                        "b",
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x39:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    // correct for duplicate helper usage
                    this._regIP -= 1;

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
                        "w",
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x3A:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    // correct for duplicate helper usage
                    this._regIP -= 1;

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
                        "b",
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x3B:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    // correct for duplicate helper usage
                    this._regIP -= 1;

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
                        "b",
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x3C:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                case 0x3D:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;

                /**
                 * Instruction : DEC
                 * Meaning     : Decrement by 1
                 * Notes       :
                 */
                case 0x48 :
                    regX = ((this._regAH << 8) | this._regAL);
                    valResult = regX - 1;
                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x49 :
                    regX = ((this._regCH << 8) | this._regCL);
                    valResult = regX - 1;
                    this._regCH = (valResult & 0xFF00) >> 8;
                    this._regCL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x4A :
                    regX = ((this._regDH << 8) | this._regDL);
                    valResult = regX - 1;
                    this._regDH = (valResult & 0xFF00) >> 8;
                    this._regDL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x4B :
                    regX = ((this._regBH << 8) | this._regBL);
                    valResult = regX - 1;
                    this._regBH = (valResult & 0xFF00) >> 8;
                    this._regBL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x4C :
                    regX = this._regSP;
                    valResult = regX - 1;
                    this._regSP = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x4D :
                    regX = this._regBP;
                    valResult = regX - 1;
                    this._regBP = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x4E :
                    regX = this._regSI;
                    valResult = regX - 1;
                    this._regSI = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

                    this._regIP += 1;

                    break;
                case 0x4F :
                    regX = this._regDI;
                    valResult = regX - 1;
                    this._regDI = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "sub");

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
                    // Group opcodes use R/M to determine register (REG is used to determine
                    // instruction)
                    valDst = this._getRegValueForOp({w:opcode.w, d:opcode.d, reg:opcode.rm, rm:opcode.rm});
                    var clampMask;
                    var size;

                    // Updating IP offsets, helper functions now increment IP
                    if (0x80 === opcode_byte)
                    {
                        valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                        // Clamp source to byte
                        valSrc = valSrc & 0x00FF;

                        // Clamp value to byte
                        clampMask = 0x00FF;

                        size = "b";

                        this._regIP += 2;
                    }
                    else if (0x81 === opcode_byte)
                    {
                        valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                        // Clamp value to word
                        clampMask = 0xFFFF;

                        size = "w";

                        this._regIP += 3;
                    }
                    else if (0x82 === opcode_byte)
                    {
                        valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                        // Clamp source to byte
                        valSrc = valSrc & 0x00FF;

                        // Clamp value to byte
                        clampMask = 0x00FF;

                        size = "b";

                        this._regIP += 3;
                    }
                    else if (0x83 === opcode_byte)
                    {
                        valSrc = this._memoryV[this._regIP + 1];

                        // Clamp source to byte
                        valSrc = valSrc & 0x00FF;

                        // Clamp value to word
                        clampMask = 0xFFFF;

                        size = "w";

                        // Sign extend to word
                        if ( 1 === ( (valSrc & 0x80) >> 7)) valSrc = 0xFF00 | valSrc;

                        this._regIP += 2;
                    }

                    switch (opcode.reg) {
                        case 1 :
                            if (_breakOnError) _Cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "Opcode not implemented!",
                                decObj     : opcode,
                                regObj     : this._bundleRegisters(),
                                memObj     : this._memoryV
                            });
                            break;
                        /**
                         * Instruction : ADC
                         * Meaning     : Add with carry
                         * Notes       : Sums the two operands, if CF is set adds one to the result
                         */
                        case 2 :
                            valResult = valDst + valSrc;
                            if (this._regFlags & this.FLAG_CF_MASK) valResult += 1;

                            // Set clamped word
                            this._setRMValueForOp(opcode, (valResult & clampMask));

                            // correct for duplicate helper usage
                            this._regIP -= 2;

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
                                size,
                                "add");

                            this._regIP += 1;

                            break;
                        case 3 :
                            if (_breakOnError) _Cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "Opcode not implemented!",
                                decObj     : opcode,
                                regObj     : this._bundleRegisters(),
                                memObj     : this._memoryV
                            });
                            break;
                        /**
                         * Instruction : AND
                         * Meaning     : Logical AND
                         * Notes       :
                         */
                        case 4 :
                            valResult = valDst & valSrc;

                            // Set clamped word
                            this._setRMValueForOp(opcode, (valResult & clampMask));

                            // correct for duplicate helper usage
                            this._regIP -= 2;

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
                                size,
                                "add");

                            this._regIP += 1;
                            break;
                        /**
                         * Instruction : SUB
                         * Meaning     : Subtract
                         * Notes       : The source is subtracted from the destination and
                         *               the result is stored in the destination
                         */
                        case 5 :
                            valResult = valDst - valSrc;

                            // Set clamped word
                            this._setRMValueForOp(opcode, (valResult & clampMask));

                            // correct for duplicate helper usage
                            this._regIP -= 2;

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
                                size,
                                "add");

                            this._regIP += 1;
                            break;
                        case 6 :
                            if (_breakOnError) _Cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "Opcode not implemented!",
                                decObj     : opcode,
                                regObj     : this._bundleRegisters(),
                                memObj     : this._memoryV
                            });
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
                                size,
                                "sub");

                            break;
                        default :
                            if (_breakOnError) _Cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "Invalid opcode!",
                                decObj     : opcode,
                                regObj     : this._bundleRegisters(),
                                memObj     : this._memoryV
                            });
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
                    regX = ((this._regAH << 8) | this._regAL);
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x41 :
                    regX = ((this._regCH << 8) | this._regCL);
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regCH = (valResult & 0xFF00) >> 8;
                    this._regCL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x42 :
                    regX = ((this._regDH << 8) | this._regDL);
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regDH = (valResult & 0xFF00) >> 8;
                    this._regDL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x43 :
                    regX = ((this._regBH << 8) | this._regBL);
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regBH = (valResult & 0xFF00) >> 8;
                    this._regBL = (valResult & 0x00FF);

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x44 :
                    regX = this._regSP;
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regSP = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x45 :
                    regX = this._regBP;
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regBP = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x46 :
                    regX = this._regSI;
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regSI = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;
                case 0x47 :
                    regX = this._regDI;
                    valResult = (regX + 1) & 0xFFFF; // Clamp to word
                    this._regDI = valResult;

                    this._setFlags(
                        regX,
                        1,
                        valResult,
                        (   this.FLAG_ZF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_AF_MASK),
                        'w',
                        "add");

                    this._regIP += 1;

                    break;

                /**
                 * Instruction : JMP
                 * Meaning     : Unconditional jump
                 * Notes       : Unconditionally transfers control to "label"
                 */
                case 0xEB:
                    this._shortJump();
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
                case 0x88:
                    this._setRMValueForOp(opcode);
                    this._regIP += 1;
                    break;
                case 0x89:
                    this._setRMValueForOp(opcode);
                    this._regIP += 1;
                    break;
                case 0x8A:
                    this._setRegValueForOp(opcode, (this._memoryV[this._regIP + 1]) );
                    this._regIP += 1;
                    break;
                case 0x8B:
                    var val = this._getRMValueForOp(opcode,
                        ((this._memoryV[this._regIP + 3] << 8) | this._memoryV[this._regIP + 2])
                    );
                    this._setRegValueForOp(opcode, val);
                    this._regIP += 1;
                    break;
                case 0x8C:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                case 0x8E:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                // Move with displacement ???
                case 0xA0:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                case 0xA1:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                case 0xA2:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                case 0xA3:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
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
                 * Instruction : NOP
                 * Meaning     : Logical inclusive or of the operands
                 * Notes       :
                 */
                case 0x90:
                    this._regIP += 1;
                    break;

                /**
                 * Instruction : OR
                 * Meaning     : Logical inclusive or of the operands
                 * Notes       :
                 */
                case 0x08:
                case 0x0A:
                    valDst = this._getRMValueForOp(opcode);
                    valSrc = this._getRegValueForOp(opcode);

                    valResult = valDst || valSrc;
                    this._setRMValueForOp(opcode, valResult);

                    // Since we've used 3 helpers we've counted the addressing byte 3 times, correct this
                    this._regIP -= 2;

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'b',
                        "or");

                    this._regIP += 1;

                    break;
                case 0x09:
                case 0x0B:
                    valDst = this._getRMValueForOp(opcode);
                    valSrc = this._getRegValueForOp(opcode);

                    valResult = valDst || valSrc;
                    this._setRMValueForOp(opcode, valResult);

                    // Since we've used 3 helpers we've counted the addressing byte 3 times, correct this
                    this._regIP -= 2;

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'w',
                        "or");

                    this._regIP += 1;

                    break;
                case 0x0C:
                    valDst = this._regAL;
                    valSrc = (this._memoryV[this._regIP + 1]);

                    this._regAL = valDst || valSrc;

                    this._setFlags(
                        valDst,
                        valSrc,
                        this._regAL,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'b',
                        "or");

                    this._regIP += 2;

                    break;
                case 0x0D:
                    valDst = ((this._regAH << 8) | this._regAL);
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst || valSrc;

                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'w',
                        "or");

                    this._regIP += 3;

                    break;

                /**
                 * Instruction : POP
                 * Meaning     : Get 16 bit value from the stack.
                 * Notes       :
                 */
                case 0x07:
                    this._regES = this._pop();
                    this._regIP += 1;
                    break;
                case 0x17:
                    this._regSS = this._pop();
                    this._regIP += 1;
                    break;
                case 0x1F:
                    this._regDS = this._pop();
                    this._regIP += 1;
                    break;
                case 0x58:
                    valResult = this._pop();
                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);
                    this._regIP += 1;
                    break;
                case 0x59:
                    valResult = this._pop();
                    this._regCH = (valResult & 0xFF00) >> 8;
                    this._regCL = (valResult & 0x00FF);
                    this._regIP += 1;
                    break;
                case 0x5A:
                    valResult = this._pop();
                    this._regDH = (valResult & 0xFF00) >> 8;
                    this._regDL = (valResult & 0x00FF);
                    this._regIP += 1;
                    break;
                case 0x5B:
                    valResult = this._pop();
                    this._regBH = (valResult & 0xFF00) >> 8;
                    this._regBL = (valResult & 0x00FF);
                    this._regIP += 1;
                    break;
                case 0x5C:
                    this._regSP = this._pop();
                    this._regIP += 1;
                    break;
                case 0x5D:
                    this._regBP = this._pop();
                    this._regIP += 1;
                    break;
                case 0x5E:
                    this._regSI = this._pop();
                    this._regIP += 1;
                    break;
                case 0x5F:
                    this._regDI = this._pop();
                    this._regIP += 1;
                    break;
                case 0x8F:
                    // This one isn't as easy
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;

                /**
                 * Instruction : PUSH
                 * Meaning     : Store 16 bit value in the stack.
                 * Notes       :
                 */
                case 0x06:
                    this._push(this._regES);
                    this._regIP += 1;
                    break;
                case 0x0E:
                    this._push(this._regCS);
                    this._regIP += 1;
                    break;
                case 0x16:
                    this._push(this._regSS);
                    this._regIP += 1;
                    break;
                case 0x1E:
                    this._push(this._regDS);
                    this._regIP += 1;
                    break;
                case 0x50:
                    this._push(((this._regAH << 8) | this._regAL));
                    this._regIP += 1;
                    break;
                case 0x51:
                    this._push(((this._regCH << 8) | this._regCL));
                    this._regIP += 1;
                    break;
                case 0x52:
                    this._push(((this._regDH << 8) | this._regDL));
                    this._regIP += 1;
                    break;
                case 0x53:
                    this._push(((this._regBH << 8) | this._regBL));
                    this._regIP += 1;
                    break;
                case 0x54:
                    this._push(this._regSP);
                    this._regIP += 1;
                    break;
                case 0x55:
                    this._push(this._regBP);
                    this._regIP += 1;
                    break;
                case 0x56:
                    this._push(this._regSI);
                    this._regIP += 1;
                    break;
                case 0x57:
                    this._push(this._regDI);
                    this._regIP += 1;
                    break;

                /**
                 * Instruction : RET
                 * Meaning     : Return From Procedure.
                 * Notes       :
                 */
                case 0xC2:
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Opcode not implemented!",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
                    break;
                case 0xC3:
                    this._regIP = (this._pop());
                    break;

                /**
                 * Instruction : SBB
                 * Meaning     : Subtract with borrow
                 * Notes       : Subtracts the two operands, if CF is set subtracts
                 *               one from the result
                 */
                case 0x18 :
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst - valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult -= 1;

                    // Set clamped byte
                    this._setRMValueForOp(opcode, (valResult & 0x00FF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x19 :
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst - valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult -= 1;

                    // Set clamped word
                    this._setRMValueForOp(opcode, (valResult & 0xFFFF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x1A :
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst - valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult -= 1;

                    // Set clamped byte
                    this._setRMValueForOp(opcode, (valResult & 0x00FF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x1B :
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst - valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult -= 1;

                    // Set clamped word
                    this._setRMValueForOp(opcode, (valResult & 0xFFFF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x1C :
                    valDst = this._regAL;
                    valSrc = this._memoryV[this._regIP + 1];

                    valResult = valDst - valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult -= 1;

                    // Set clamped byte
                    this._setRMValueForOp(opcode, (valResult & 0x00FF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x1D :
                    valDst = ((this._regAH << 8) | this._regAL);
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst - valSrc;
                    if (this._regFlags & this.FLAG_CF_MASK) valResult -= 1;

                    // Set clamped word
                    this._setRMValueForOp(opcode, (valResult & 0xFFFF));

                    // correct for duplicate helper usage
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

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

                /**
                 * Instruction : SUB
                 * Meaning     : Subtract
                 * Notes       : The source is subtracted from the destination and
                 *               the result is stored in the destination
                 */
                case 0x28:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst - valSrc;

                    this._setRMValueForOp(opcode, valResult & 0x00FF);

                    // correct for duplicate helper usage
                    this._regIP -= 4; // This seems wonky but it works for the moment

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x29:
                    valDst = this._getRMValueForOp(opcode);  // E
                    valSrc = this._getRegValueForOp(opcode); // G

                    valResult = valDst - valSrc;

                    this._setRMValueForOp(opcode, valResult & 0xFFFF);

                    // correct for 3 helper usages
                    this._regIP -= 3;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x2A:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst - valSrc;

                    this._setRegValueForOp(opcode, valResult & 0x00FF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "b",
                        "add");

                    this._regIP += 1;

                    break;
                case 0x2B:
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    valResult = valDst - valSrc;

                    this._setRMValueForOp(opcode, valResult & 0xFFFF);

                    // correct for 3 helper usages
                    this._regIP -= 2;

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                case 0x2C:
                    valDst = this._regAL;
                    valSrc = this._memoryV[this._regIP + 1];

                    valResult = valDst - valSrc;

                    this._regAL = valResult & 0x00FF;

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
                        "b",
                        "add");

                    this._regIP += 2;

                    break;
                case 0x2D:
                    valDst = ((this._regAH << 8) | this._regAL);
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst - valSrc;

                    this._regAH = (valResult & 0xFF00) >> 8;
                    this._regAL = (valResult & 0x00FF);

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
                        "w",
                        "add");

                    this._regIP += 1;

                    break;

                /**
                 * Instruction : XCHG
                 * Meaning     : Exchange contents of source and destination
                 * Notes       :
                 */
                case 0x86 :
                case 0x87 :
                    valDst = this._getRegValueForOp(opcode); // G
                    valSrc = this._getRMValueForOp(opcode);  // E

                    //console.log("  valDst",valDst);
                    //console.log("  valSrc",valSrc);

                    this._setRegValueForOp(opcode, valSrc);
                    this._setRMValueForOp(opcode, valDst);

                    // Correct for duplicate helper usage
                    this._regIP -= 3;

                    this._regIP += 1;

                    break;
                case 0x91 :
                    // Exchange CX and AX
                    valDst = ((this._regCH << 8) | this._regCL);
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regCH = (valSrc & 0xFF00) >> 8;
                    this._regCL = (valSrc & 0x00FF);

                    this._regIP += 1;

                    break;
                case 0x92 :
                    // Exchange DX and AX
                    valDst = ((this._regDH << 8) | this._regDL);
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regDH = (valSrc & 0xFF00) >> 8;
                    this._regDL = (valSrc & 0x00FF);

                    this._regIP += 1;

                    break;
                case 0x93 :
                    // Exchange BX and AX
                    valDst = ((this._regBH << 8) | this._regBL);
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regBH = (valSrc & 0xFF00) >> 8;
                    this._regBL = (valSrc & 0x00FF);

                    this._regIP += 1;

                    break;
                case 0x94 :
                    // Exchange SP and AX
                    valDst = this._regSP;
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regSP = valSrc;

                    this._regIP += 1;

                    break;
                case 0x95 :
                    // Exchange BP and AX
                    valDst = this._regBP;
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regBP = valSrc;

                    this._regIP += 1;

                    break;
                case 0x96 :
                    // Exchange SI and AX
                    valDst = this._regSI;
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regSI = valSrc;

                    this._regIP += 1;

                    break;
                case 0x97 :
                    // Exchange DI and AX
                    valDst = this._regDI;
                    valSrc = ((this._regAH << 8) | this._regAL);

                    this._regAH = (valDst & 0xFF00) >> 8;
                    this._regAL = (valDst & 0x00FF);

                    this._regDI = valSrc;

                    this._regIP += 1;

                    break;

                /**
                 * Instruction : XOR
                 * Meaning     : Performs a bitwise exclusive or of the operands.
                 * Notes       :
                 */
                case 0x30:
                    valDst = this._getRMValueForOp(opcode);
                    valSrc = this._getRegValueForOp(opcode);

                    valResult = valDst ^ valSrc;
                    this._setRMValueForOp(opcode, valResult);

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'b',
                        "or");

                    this._regIP += 1;

                    break;
                case 0x31:
                    valDst = this._getRMValueForOp(opcode);
                    valSrc = this._getRegValueForOp(opcode);

                    valResult = valDst ^ valSrc;
                    this._setRMValueForOp(opcode, valResult);

                    // Since we've used 3 helpers we've counted the addressing byte 3 times, correct this
                    this._regIP -= 2;

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'w',
                        "or");

                    this._regIP += 1;

                    break;
                case 0x32:
                    valDst = this._getRegValueForOp(opcode);
                    valSrc = this._getRMValueForOp(opcode);

                    valResult = valDst ^ valSrc;
                    this._setRegValueForOp(opcode, valResult);

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'b',
                        "or");

                    this._regIP += 1;

                    break;
                case 0x33:
                    valDst = this._getRegValueForOp(opcode);
                    valSrc = this._getRMValueForOp(opcode);

                    valResult = valDst ^ valSrc;
                    this._setRegValueForOp(opcode, valResult);

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'w',
                        "or");

                    this._regIP += 1;

                    break;
                case 0x34:
                    valDst = this._regAL;
                    valSrc = this._memoryV[this._regIP + 1];

                    valResult = valDst ^ valSrc;
                    this._regAL = valResult;

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'b',
                        "or");

                    this._regIP += 2;

                    break;
                case 0x35:
                    valDst = ( (this._regAH << 8) | this._regAL );
                    valSrc = ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);

                    valResult = valDst ^ valSrc;
                    this._regAL = valResult;

                    this._setFlags(
                        valDst,
                        valSrc,
                        valResult,
                        (   this.FLAG_CF_MASK |
                            this.FLAG_OF_MASK |
                            this.FLAG_PF_MASK |
                            this.FLAG_SF_MASK |
                            this.FLAG_ZF_MASK),
                        'w',
                        "or");

                    this._regIP += 3;

                    break;


                default :
                    if (_breakOnError) _Cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Unknown opcode [0x" + opcode_byte.toString(16) + "]",
                        decObj     : opcode,
                        regObj     : this._bundleRegisters(),
                        memObj     : this._memoryV
                    });
            }

            // TODO: Update timers

            // Post-cycle Debug
            if (_Cpu.isDebug())
            {
                _Cpu.debugUpdateRegisters(this._bundleRegisters());
            }

        },

        _push : function (value)
        {
            //console.log("Pushing ", value.toString(16), " to ", this._regSP.toString(16));
            //console.log("  before", this._memoryV[this._regSP].toString(16));

            // Update stack pointer
            this._regSP -= 2;

            this._memoryV[this._regSP]     = (value & 0x00FF);
            this._memoryV[this._regSP + 1] = (value >> 8);

            //console.log("  after", this._memoryV[this._regSP].toString(16));
        },

        _pop : function ()
        {
            // Get the value from the stack
            var value = ((this._memoryV[this._regSP + 1] << 8) | this._memoryV[this._regSP]);

            // Zero the memory locations on the stack.
            // This isn't necessary but helps with debugging
            this._memoryV[this._regSP]     = 0;
            this._memoryV[this._regSP + 1] = 0;


            this._regSP += 2;

            return value;
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
         * TODO: This hasn't been tested for all operations
         *
         * @param operand1
         * @param operand2
         * @param result
         * @param flagsToSet
         * @param size (only used for OF)
         * @param operation (add | sub | mul | div | or)
         * @private
         */
        _setFlags : function (operand1, operand2, result, flagsToSet, size, operation)
        {
            // Set defaults
            size = size || 'b';

            // Carry Flag (CF)
            // Indicates when an arithmetic carry or borrow has been generated
            // out of the most significant ALU bit position
            if (flagsToSet & this.FLAG_CF_MASK)
            {
                // is this addition (this seems like a stupid way to handle this)
                switch (operation)
                {
                    case "or" :
                    case "add" :
                        if ('b' === size && result > 0xFF) this._regFlags |= this.FLAG_CF_MASK;
                        else if ('w' === size && result > 0xFFFF) this._regFlags |= this.FLAG_CF_MASK;
                        else this._regFlags &= ~this.FLAG_CF_MASK;
                        break;
                    case "sub" :
                        if (operand1 < operand2) this._regFlags |= this.FLAG_CF_MASK;
                        else this._regFlags &= ~this.FLAG_CF_MASK;
                        break;
                    case "mul" :
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "Multiply CF flag not implemented!",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        break;
                    case "div" :
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "Multiply CF flag not implemented!",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        break;
                }
            }

            // Parity Flag (PF)
            // Indicates if the number of set bits is odd or even in the binary
            // representation of the result of the last operation
            if (flagsToSet & this.FLAG_PF_MASK)
            {
                var bitRep = result.toString(2),
                    bitCnt = 0;
                for (b in bitRep) { if ("1" === bitRep[b]) bitCnt++; }

                if (0 === (bitCnt % 2))
                {
                    this._regFlags |= this.FLAG_PF_MASK;
                }
                else
                {
                    this._regFlags &= ~this.FLAG_PF_MASK;
                }
            }

            // Adjust Flag (AF)
            // Indicate when an arithmetic carry or borrow has been generated out
            // of the 4 least significant bits.
            if (flagsToSet & this.FLAG_AF_MASK)
            {
                switch (operation)
                {
                    case "or" :
                    case "add" :
                        if ((result & 0x0F) > 0x0F) this._regFlags |= this.FLAG_AF_MASK;
                        else this._regFlags &= ~this.FLAG_AF_MASK;
                        break;
                    case "sub" :
                        if ((operand1 & 0x0F) < (operand2 & 0x0F)) this._regFlags |= this.FLAG_AF_MASK;
                        else this._regFlags &= ~this.FLAG_AF_MASK;
                        break;
                    case "mul" :
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "Multiply AF flag not implemented!",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        break;
                    case "div" :
                        if (_breakOnError) _Cpu.halt({
                            error      : true,
                            enterDebug : true,
                            message    : "Division AF flag not implemented!",
                            decObj     : opcode,
                            regObj     : this._bundleRegisters(),
                            memObj     : this._memoryV
                        });
                        break;
                }

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
                if ('b' === size && (result & 0xFF) >> 7) this._regFlags |= this.FLAG_SF_MASK;
                else if ('w' === size && (result & 0xFFFF) >> 15) this._regFlags |= this.FLAG_SF_MASK;
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
    };

    return Cpu8086;
});