/**
 * Emulator CPU
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "emu/gfx",
    "emu/cpu",
    "emu/input",
    "emu/storage"
],
function(
    Gfx,
    Cpu,
    Input,
    Storage
)
{
    _Gui = null;



    var Cpu = {
        _cpuPaused : false,

        _debugFlag : false,

        // Should this be on or off to begin?
        _drawFlag : false,

        _cycles : 0,

        _blob : null,

        _cpu : null,

        settings : null,

        boot : function (settings)
        {
            // Save the settings
            this.settings = settings;

            // Configure the debug settings

            // Load the required CPU
            var _this = this;
            require([
                "emu/cpus/" + this.settings['blob-settings']['cpu-init']['type'],
                "gui/gui"
            ], function(
                cpuModel,
                Gui
            ){
                // Save the gui module
                _Gui = Gui;

                // Save the cpu module
                _cpu = cpuModel;

                // Initialize the CPU
                _this.reset();

                // Setup debugging
                if (_this.settings['debug-settings']['startInDebug'])
                {
                    _this._debugFlag = true;
                    //_this._cpuPaused = true;
                }

                // Initialize input
                Input.setupInput();

                // Initialize storage
                Storage.load();

                // If this run is blob-type load the blob that should have
                // previously been set
                if ("blob" === _this.settings["run-type"])
                {
                    _cpu.loadBinary(_this.settings["blob-settings"]["address"], _this._blob);
                }

                // Initialize Graphics
                Gfx.setupGraphics(document.getElementById('gfx-port'), _this,
                    function () {
                        // Done initializing Gfx
                        _this.run();
                    }
                );
            });
        },

        // Emulation loop
        run : function ()
        {
            for(;;)
            {
                if (_cpu.halt) break;

                if (!this._cpuPaused)
                {
                    // Emulate one cycle
                    this._emulateCycle();

                    this._cycles++;

                    if (0 === this._cycles % 100) this._drawFlag = true;

                    // If the draw flag is set, update the screen
                    if(this._drawFlag)
                    {
                        Gfx.drawGraphics();
                        this._drawFlag = false;
                    }

                    // Store key press state (Press and Release)
                    Input.setKeys();

                    // Debug
                    if (this._debugFlag)
                    {
                        break;
                    }

                    // TODO: set drawflag appropriately
                    this._drawFlag = true;
                }

                if (this._debugFlag) break;
            }
        },

        getIP : function()
        {
            return _cpu._regIP;
        },

        setBinary : function (blob)
        {
            this._blob = blob;
        },

        reset : function ()
        {
            this._cpuPaused = false;
            this._halt      = false;

            _cpu.reset(this);
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
            if (!_cpu.halt) this.run();
        },

        toggleDebug : function ()
        {
            this._debugFlag = !this._debugFlag;
        },

        enableDebug : function ()
        {
            this._debugFlag = true;
        },

        disableDebug : function ()
        {
            this._debugFlag = true;
        },

        isDebug : function ()
        {
            return this._debugFlag;
        },

        setMemoryBlock : function (memoryBlob, offset)
        {
            _cpu._memoryV.set(memoryBlob, offset);
        },

        getMemoryBlock : function (start, size)
        {
            if ('undefined' === typeof start && 'undefined' === typeof size)
            {
                return _cpu._memoryV;
            }
            else {
                return _cpu._memoryV.subarray(start, start + size);
            }
        },

        getMem8 : function(addr8)
        {
            return _cpu._memoryV[addr8];
        },

        getMem16 : function(addr16)
        {
    //        ((this._memoryV[this._regIP + 2] << 8) | this._memoryV[this._regIP + 1]);
    //        return _cpu._memoryV[addr16];
        },

        _emulateCycle : function ()
        {
            _cpu.emulateCycle();
        },

        debugUpdateDecode : function(decodeObj)
        {
            _Gui.debugUpdateDecode(decodeObj);
        },

        debugUpdateRegisters : function(regObj)
        {
            _Gui.debugUpdateRegister(regObj);
        },

        debugUpdateMemory : function(memoryObj)
        {
            _Gui.debugUpdateMemory(memoryObj);
        }
    };

    return Cpu;
});


