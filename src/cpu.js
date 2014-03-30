var cpu = {
    _cpuModel : "cpu8086",

    _cpuPaused : false,

    _debugFlag : false,

    // Should this be on or off to begin?
    _drawFlag : false,

    _cycles : 0,

    initialize : function ()
    {
        window[this._cpuModel].initialize();
        this._cycles = 0;
    },

    boot : function ()
    {
        console.log("booting system...");
    },

    // Emulation loop
    run : function ()
    {
        for(;;)
        {
            if (window[this._cpuModel].halt) break;

            if (!this._cpuPaused)
            {
                // Debug
                if (this._debugFlag)
                {
                    gui.centerMemoryDisplay(this.getIP());
                    gui.displayMemory();
                }

                // Emulate one cycle
                this._emulateCycle();

                this._cycles++;

                if (0 === this._cycles % 100) this._drawFlag = true;

                // If the draw flag is set, update the screen
                if(this._drawFlag)
                {
                    gfx.drawGraphics();
                    this._drawFlag = false;
                }

                // Store key press state (Press and Release)
                input.setKeys();

                // Debug
                if (this._debugFlag)
                {
                    break;
                }

                // TODO: set drawflag appropriately
                this._drawFlag = true;
            }
        }
    },

    getIP : function()
    {
        return window[this._cpuModel]._regIP;
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

    setMemoryBlock : function (memoryBlob, offset)
    {
        window[this._cpuModel]._memoryV.set(memoryBlob, offset);
    },

    getMemoryBlock : function (start, size)
    {
        return window[this._cpuModel]._memoryV.subarray(start, start + size);
    },

    getMem8 : function(addr8)
    {
        return window[this._cpuModel]._memoryV[addr8];
    },

    getMem16 : function(addr16)
    {
//        ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);
//        return window[this._cpuModel]._memoryV[addr16];
    },
    
    _emulateCycle : function ()
    {
        window[this._cpuModel].emulateCycle();
    }
};


