var cpu = {
    _cpuModel : "cpu8086",

    _cpuPaused : false,

    _debugFlag : false,

    _drawFlag : false,

    initialize : function ()
    {
        window[this._cpuModel].initialize();
    },

    boot : function (img)
    {
        console.log("boot");
    },

    // Emulation loop
    run : function ()
    {
        console.log("run");
        for(;;)
        {
            if (window[this._cpuModel].halt) break;

            if (!this._cpuPaused)
            {
                // Emulate one cycle
                this._emulateCycle();

                // If the draw flag is set, update the screen
                if(this._drawFlag)
                    gfx.drawGraphics();

                // Store key press state (Press and Release)
                input.setKeys();

                // Debug
                if (this._debugFlag) break;
            }
        }
    },
    
    loadBinary : function (addr, blob)
    {
        window[this._cpuModel].loadBinary(addr, blob);
    },

    reset : function ()
    {
        this._cpuPaused = false;
        this._halt      = false;

        window[this._cpuModel].reset();
    },

    pause : function ()
    {
        this._cpuPaused = true;
    },

    halt : function ()
    {
        this._halt = true;
    },

    step : function ()
    {
        if (!window[this._cpuModel].halt) this.run();
    },

    toggleDebug : function ()
    {
        this._debugFlag = !this._debugFlag;
    },

    isDebug : function ()
    {
        return this._debugFlag;
    },
    
    _emulateCycle : function ()
    {
        window[this._cpuModel].emulateCycle();
    },

    printOpcodeDebug : function (opcode_byte, addressing_byte, opcode)
    {
        console.log("" +
            "--------------------------------------------------------------------[decode]\n" +
            "instruction : " + oplist.retrieveCode(opcode_byte) + "\n" +
            "opcode_byte = 0x" + opcode_byte.toString(16) + " [" + opcode_byte.toString(2) + "]\n" +
            "    op : 0x" + opcode.opcode.toString(16) + " [" + opcode.opcode.toString(2) + "]\n" +
            "    d  : 0x" + opcode.d.toString(16) + " [" + opcode.d.toString(2) + "]\n" +
            "    w  : 0x" + opcode.w.toString(16) + " [" + opcode.w.toString(2) + "]\n" +
            "addressing_byte = 0x" + addressing_byte.toString(16) + " [" + addressing_byte.toString(2) + "]\n" +
            "    mod : 0x" + opcode.mod.toString(16) + " [" + opcode.mod.toString(2) + "]\n" +
            "    reg : 0x" + opcode.reg.toString(16) + " [" + opcode.reg.toString(2) + "]\n" +
            "    rm  : 0x" + opcode.rm.toString(16)  + " [" + opcode.rm.toString(2) + "]"
        );
    }
};


