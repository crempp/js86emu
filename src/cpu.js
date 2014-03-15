var cpu = {
    _cpuModel : "cpu8086",

    _cpuPaused : false,
    _halt      : false,

    _debugFlag : false,

    _drawFlag : false,

    initialize : function ()
    {
        cpu8086.initialize();
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
            if (this._halt) break;

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
        this.run();
    },

    toggleDebug : function ()
    {
        this._debugFlag = !this._debugFlag;
    },
    
    _emulateCycle : function ()
    {
        window[this._cpuModel].emulateCycle();
    }
};


