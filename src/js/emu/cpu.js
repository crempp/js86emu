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
    "emu/storage",
    "gui/models/SettingsModel"
],
function(
    Gfx,
    Cpu,
    Input,
    Storage,
    SettingsModel
)
{
    _Gui = null;

    var Cpu = {
        STATE_PAUSED  : 0,
        STATE_RUNNING : 1,
        STATE_STOPPED : 2,

        state : 2,

        _debugFlag : false,

        _haltFlag : false,

        _drawFlag : false,

        _cycles : 0,

        _blob : null,

        _cpu : null,

        boot : function ()
        {
            // Load the required CPU
            var _this = this;
            require([
                "emu/cpus/" + SettingsModel.get('emuSettings')['blobSettings']['cpu-init']['type'],
                "gui/gui"
            ], function(
                cpuModel,
                Gui
            ){
                // Initialize settings and state
                _this.state     = _this.STATE_RUNNING;
                _this._drawFlag = false;
                _this._cycles   = 0;
                _this._haltFlag = false;

                // Setup debugging
                if (SettingsModel.get('emuSettings')['startInDebug'])
                {
                    _this._debugFlag = true;
                }

                // Save the gui module
                _Gui = Gui;

                // Save the cpu module
                _cpu = cpuModel;

                // Initialize the CPU
                _cpu.reset(_this, SettingsModel.get('emuSettings')["blobSettings"]);

                // Initialize input
                Input.setupInput();

                // Initialize storage
                Storage.load();

                // If this run is blob-type load the blob that should have
                // previously been set
                //SettingsModel.get('emuSettings')['startInDebug']
                if ("blob" === SettingsModel.get('emuSettings')["run-type"])
                {
                    _cpu.loadBinary(SettingsModel.get('emuSettings')["blobSettings"]["address"], _this._blob);
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
            this.state = this.STATE_RUNNING;

            for(;;)
            {
                // if (11500 === this._cycles) this._debugFlag = true;
                // if (0x011D === _cpu._regIP) this._debugFlag = true;

                if (this._haltFlag || this.state === this.STATE_STOPPED){
                    Gfx.drawGraphics();
                    break;
                }

                if (this.state === this.STATE_PAUSED)
                {
                    break;
                }

                // Emulate one cycle
                _cpu.emulateCycle();

                this._cycles++;

                // TODO: This is wrong! Research the correct timing
                //if (0 === this._cycles % 100) this._drawFlag = true;

                // If the draw flag is set, update the screen
                if(this._drawFlag)
                {
                    Gfx.drawGraphics();
                    this._drawFlag = false;
                }

                // Store key press state (Press and Release)
                Input.setKeys();


                if (this._debugFlag && !this._haltFlag)
                {
                    this.pause();
                    break;
                }
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
            this.state     = this.STATE_STOPPED;
            this._drawFlag = false;
            this._cycles   = 0;
            this._haltFlag = false;

            _cpu.reset(this, SettingsModel.get('emuSettings')["blobSettings"]);

            Gfx.drawGraphics();

            _Gui.setControlState("stopped");

            _Gui.disableDebug();
        },

        pause : function ()
        {
            this.state = this.STATE_PAUSED;
            _Gui.setControlState("paused");
        },

        halt : function (options)
        {
            options = options || {
                error      : false,
                enterDebug : false,
                message    : "",
                decObj     : null,
                regObj     : null,
                memObj     : null
            };

            Gfx.drawGraphics();

            this._haltFlag = true;
            this.state     = this.STATE_STOPPED;

            _Gui.setControlState("stopped");

            if (options.enterDebug)
            {
                this._debugFlag = true;
                _Gui.debugUpdateDecode(options.decObj);
                _Gui.debugUpdateRegister(options.regObj);
                _Gui.debugUpdateMemory(options.memObj);
                _Gui.debugUpdateInfo(options);
            }

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


