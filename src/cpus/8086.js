var cpu8086 = {
    _opcode  : 0x00,
    _memory  : null,
    _memoryV : null,
    
    // Main Registers
    _regAH : 0x00, _regAL : 0x00, // primary accumulator
    _regBH : 0x00, _regBL : 0x00, // base, accumulator
    _regCH : 0x00, _regCL : 0x00, // counter, accumulator
    _regDH : 0x00, _regDL : 0x00, // accumulator, other functions
    
    // Index registers
    _regSI : 0x0000, // Source Index
    _regDI : 0x0000, // Destination Index
    _regBP : 0x0000, // Base Pointer
    _regSP : 0x0000, // Stack Pointer
    
    // Program counter
    _regIP : 0x0000, // Instruction Pointer
    
    // Segment registers
    _regCS : 0x0000, // Code Segment
    _regDS : 0x0000, // Data Segment
    _regES : 0x0000, // ExtraSegment
    _regSS : 0x0000, // Stack Segment
    
    // Status register
    // Flags: - - - - O D I T S Z - A - P - C
    _regFlags : 0x0000,



    reset : function ()
    {
        console.log("initialize");

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
        this._regSP = 0x0000;

        // Program counter
        this._regIP = 0x0000;

        // Segment registers
        this._regCS = 0x0000;
        this._regDS = 0x0000;
        this._regES = 0x0000;
        this._regSS = 0x0000;

        // Status register
        // Flags: - - - - O D I T S Z - A - P - C
        this._regFlags = 0x0000;
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
        // Fetch Opcode
        //opcode = memory[this._regIP] << 8 | memory[pc + 1];
        var opcode_byte     = this._memoryV[this._regIP];
        var addressing_byte = this._memoryV[this._regIP + 1];

        // Decode Opcode
        // The entire first byte is the opcode but it includes the 'd' and 'w' flags. I am decoding these even though
        // it probably isn't necessary.
        var prefix = null, // Not supporting prefix opcodes yet
            opcode = (opcode_byte & 0xFC) >>> 2,
            d      = (opcode_byte & 0x02) >>> 1,
            w      = (opcode_byte & 0x01),
            mod    = (addressing_byte & 0xC0) >>> 6,
            reg    = (addressing_byte & 0x38) >>> 3,
            rw     = (addressing_byte & 0x07);


        var debugStr = '' +
            "opcode_byte     = 0x" + opcode_byte.toString(16)     + " : " + opcode_byte.toString(2) + "\n" +
            "    opcode : 0x" + opcode.toString(16)  + "    d : " + d + "    w : " + w + "\n" +
            "addressing_byte = 0x" + addressing_byte.toString(16) + " : " + addressing_byte.toString(2) + "\n" +
            "    mod    : " + mod.toString(2) + "    reg : " + reg.toString(2) + " rw : " + rw.toString(2);

        console.log(debugStr);

        // Execute Opcode
        switch (opcode_byte)
        {
            case 0x81:
                // Do stuff
                this._regIP += 4;
                break;
            default :
                console.log("Unknown opcode!");
        }

        // Update timers
    }
};
