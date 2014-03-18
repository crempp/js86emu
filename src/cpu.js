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
                // Emulate one cycle
                this._emulateCycle();

                // If the draw flag is set, update the screen
                if(this._drawFlag)
                    gfx.drawGraphics();

                // Store key press state (Press and Release)
                input.setKeys();

                // Debug
                if (this._debugFlag) break;

                // TODO: set drawflag appropriately
                this._drawFlag = true;
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
    }
};


