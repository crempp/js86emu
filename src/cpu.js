var cpu = {
    _cpuModel : "cpu8086",

    _cpuPaused : false,

    _debugFlag : false,

    // Should this be on or off to begin?
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

                // If the draw flag is set, update the screen
                if(this._drawFlag)
                    gfx.drawGraphics();

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


