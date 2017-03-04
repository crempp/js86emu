define([], function()
{
    var _cursorRow    = 0;
    var _cursorColumn = 0;

    var Bios = {

        Gfx : null,

        INT10h: function(cpuModel, cpu) {
            // Run BIOS procedure
            switch (cpuModel._regAH) {
                /**
                 * Set video mode
                 *
                 * Parameters:
                 *      AL = video mode
                 * Returns:
                 *      AL = video mode flag / CRT controller mode byte
                 */
                case 0x00 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x00 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Set text-mode cursor shape
                 *
                 * Normally a character cell has 8 scan lines, 0-7. So,
                 * CX=0607h is a normal underline cursor, CX=0007h is a
                 * full-block cursor. If bit 5 of CH is set, that often
                 * means "Hide cursor". So CX=2607h is an invisible
                 * cursor.
                 *
                 * Some video cards have 16 scan lines, 00h-0Fh.
                 *
                 * Some video cards don't use bit 5 of CH. With these,
                 * make Start>End (e.g. CX=0706h)
                 *
                 * Parameters:
                 *      CH = Scan Row Start, CL = Scan Row End
                 * Returns: NONE
                 */
                case 0x01 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x01 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Set cursor position
                 *
                 * Parameters:
                 *      BH = Page Number
                 *      DH = Row
                 *      DL = Column
                 * Returns: NONE
                 */
                case 0x02 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x02 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Get cursor position and shape
                 *
                 * Parameters:
                 *      BH = Page Number
                 * Returns:
                 *      AX = 0
                 *      CH = Start scan line
                 *      CL = End scan line
                 *      DH = Row
                 *      DL = Column
                 */
                case 0x03 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x03 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Read light pen position (Does not work on VGA systems)
                 *
                 * Parameters: NONE
                 * Returns:
                 *      AH = Status (0=not triggered, 1=triggered)
                 *      BX = Pixel X
                 *      CH = Pixel Y
                 *      CX = Pixel line number for modes 0Fh-10h
                 *      DH = Character Y
                 *      DL = Character X
                 */
                case 0x04 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x04 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Select active display page
                 *
                 * Parameters:
                 *      AL = Page Number
                 * Returns: NONE
                 */
                case 0x05 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x05 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Scroll up window
                 *
                 * Parameters:
                 *      AL = lines to scroll
                 *          (0 = clear, CH, CL, DH, DL are used)
                 *      BH = Background Color and Foreground color.
                 *          BH = 43h, means that background color is
                 *          red and foreground color is cyan. Refer the
                 *          BIOS color attributes
                 *      CH = Upper row number
                 *      CL = Left column number
                 *      DH = Lower row number
                 *      DL = Right column number
                 * Returns: NONE
                 */
                case 0x06 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x06 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Scroll down window
                 *
                 * Parameters:
                 *      AL = lines to scroll
                 *          (0 = clear, CH, CL, DH, DL are used)
                 *      BH = Background Color and Foreground color.
                 *          BH = 43h, means that background color is
                 *          red and foreground color is cyan. Refer the
                 *          BIOS color attributes
                 *      CH = Upper row number
                 *      CL = Left column number
                 *      DH = Lower row number
                 *      DL = Right column number
                 * Returns: NONE
                 */
                case 0x07 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x07 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Read character and attribute at cursor position
                 *
                 * Parameters:
                 *      BH = Page Number
                 * Returns:
                 *      AH = Color, AL = Character
                 */
                case 0x08 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x08 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Write character and attribute at cursor position
                 *
                 * Parameters:
                 *      AL = Character
                 *      BH = Page Number
                 *      BL = Color
                 *      CX = Number of times to print character
                 * Returns: NONE
                 */
                case 0x09 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x09 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Write character only at cursor position
                 *
                 * Parameters:
                 *      AL = Character
                 *      BH = Page Number
                 *      CX = Number of times to print character
                 * Returns: NONE
                 */
                case 0x0A :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x0A not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Set background/border color or palette
                 */
                case 0x0B :

                    switch (self._regBH) {
                        /**
                         * Set background/border color
                         *
                         * Parameters:
                         *      BL = Background/Border color (border only in text modes)
                         * Returns: NONE
                         */
                        case 0x00 :
                            cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "BIOS Procedure 0x0B / 0x00 not implemented",
                                decObj     : cpuModel._opcode,
                                regObj     : cpuModel._bundleRegisters(),
                                memObj     : cpuModel._memoryV
                            });
                            break;

                        /**
                         * Set palette
                         *
                         * Parameters:
                         *      BL = Palette ID (was only valid in CGA,
                         *           but newer cards support it in many
                         *           or all graphics modes)
                         * Returns: NONE
                         */
                        case 0x01 :
                            cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "BIOS Procedure 0x0B / 0x01 not implemented",
                                decObj     : cpuModel._opcode,
                                regObj     : cpuModel._bundleRegisters(),
                                memObj     : cpuModel._memoryV
                            });
                            break;

                        /**
                         * Oops, BH is invalid
                         */
                        default :
                            cpu.halt({
                                error      : true,
                                enterDebug : true,
                                message    : "Invalid BIOS Procedure 0x0B argument in BH",
                                decObj     : cpuModel._opcode,
                                regObj     : cpuModel._bundleRegisters(),
                                memObj     : cpuModel._memoryV
                            });
                    }


                /**
                 * Write graphics pixel
                 *
                 * Parameters:
                 *      AL = Color
                 *      BH = Page Number
                 *      CX = x
                 *      DX = y
                 * Returns: NONE
                 */
                case 0x0C :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x0C not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Read graphics pixel
                 *
                 * Parameters:
                 *      BH = Page Number
                 *      CX = x
                 *      DX = y
                 * Returns:
                 *      AL = Color
                 */
                case 0x0D :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x0D not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Teletype output
                 *
                 * Parameters:
                 *      AL = Character
                 *      BH = Page Number
                 *      BL = Color (only in graphic mode)
                 * Returns: NONE
                 */
                case 0x0E :
                    var char = cpuModel._regAL;

                    // TODO: handle paging
                    // TODO: handle colors

                    // Cariage return
                    if (char == 0x0D) {
                        _cursorColumn = 0;
                    }
                    // Line feed
                    else if (char == 0x0A) {
                        _cursorRow++;
                    }
                    else {
                        this.Gfx.writeChar(char, _cursorRow, _cursorColumn);
                        _cursorColumn++;
                    }

                    //this.Gfx.drawGraphics()

                    break;

                /**
                 * Get current video mode
                 *
                 * Parameters: NONE
                 * Returns:
                 *      AL = Video Mode
                 *      AH = number of character columns
                 *      BH = active page
                 */
                case 0x0F :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x0F not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                /**
                 * Write string (EGA+, meaning PC AT minimum)
                 *
                 * Parameters:
                 *      AL = Write mode
                 *      BH = Page Number
                 *      BL = Color
                 *      CX = String length
                 *      DH = Row
                 *      DL = Column
                 *      ES:BP = Offset of string
                 * Returns: NONE
                 */
                case 0x13 :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "BIOS Procedure 0x13 not implemented",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
                    break;

                default :
                    cpu.halt({
                        error      : true,
                        enterDebug : true,
                        message    : "Unknown BIOS Procedure",
                        decObj     : cpuModel._opcode,
                        regObj     : cpuModel._bundleRegisters(),
                        memObj     : cpuModel._memoryV
                    });
            }
        }
    };

    return Bios;
});
