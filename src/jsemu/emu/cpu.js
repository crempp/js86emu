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
    "emu/util/data",
    "gui/models/SettingsModel"
],
function(
    Gfx,
    Cpu,
    Input,
    Storage,
    DataLoader,
    SettingsModel
)
{
    var _Gui = null;

    var _Bios = null;

    var Cpu = {
        SLOWDOWN_WAIT_TIME : 15, // (ms)
        CYCLE_CHECK_INTERVAL : 40000,

        STATE_PAUSED  : 0,
        STATE_RUNNING : 1,
        STATE_STOPPED : 2,

        state : 2, // STATE_STOPPED

        _debugFlag : false,

        _haltFlag : false,

        _drawFlag : false,

        _cycles : 0,

        _blob : null,

        _cpu : null,

        /**
         * Configure the CPU
         *
         * @returns {Promise}
         */
        configure : function ()
        {
            //console.info("Cpu::configure");

            var _this = this;

            var _configure = function (resolve, reject)
            {
                var cpuType = SettingsModel.get('emuSettings')['blobSettings']['cpu-init']['type'] || '8086';
                require([
                    "gui/gui",
                    "emu/cpus/" + cpuType,
                    "emu/bios/simplebios"
                ], function(
                    Gui,
                    cpuModel,
                    Bios
                ){
                    // Save the gui module
                    _Gui = Gui;

                    // Save the instance of the cpu module
                    _cpu = cpuModel;

                    // Initialize the CPU
                    _cpu.configure(
                        _this,
                        SettingsModel.get('emuSettings')["blobSettings"],
                        _Gui
                    );

                    // Initialize memory
                    _cpu.initializeMemory();

                    // Initialize ports
                    _cpu.initializePorts();

                    // Configure BIOS
                    _Bios = Bios;
                    _Bios.Gfx = Gfx;
                    _cpu.tmpBios = Bios;

                    // Initialize input
                    Input.setupInput();

                    // Initialize storage
                    Storage.load();

                    resolve();
                });
            };

            return new Promise(_configure);
        },

        /**
         * Clear the memory
         *
         * @returns {Promise}
         */
        clearMemory : function ()
        {
            var _clear = function (resolve, reject)
            {
                _cpu.clearMemory();

                resolve();
            }

            return new Promise(_clear);
        },

        /**
         * Clear the ports
         *
         * @returns {Promise}
         */
        clearPorts : function ()
        {
            var _clear = function (resolve, reject)
            {
                _cpu.clearPorts();

                resolve();
            }

            return new Promise(_clear);
        },

        /**
         * Load the BIOS ROM
         *
         * @returns {Promise}
         */
        loadBiosRom : function()
        {
            console.info("Cpu::loadBiosRom");

            var _this = this;

            var _load = function (resolve, reject)
            {
                // TODO: Move the bios file path to the config
                dl = DataLoader.create("files/bios-roms/8086tiny_bios");
                dl.on("load", function(arrayBuffer){
                    //console.log("done loading bios");

                    //debugger;

                    if (arrayBuffer.byteLength > 0)
                    {
                        //var load_address = _cpu.bios_rom_address - arrayBuffer.byteLength + 16;
                        var load_address = _cpu.bios_rom_address;
                        _cpu.loadBinary(load_address, arrayBuffer);

                        resolve();
                    }
                    else
                    {
                        reject(Error("No BIOS ROM data loaded"));
                    }
                });
                dl.load();
            };

            return new Promise(_load);
        },

        /**
         * Load video ROM
         *
         * @returns {Promise}
         */
        loadVideoRom : function()
        {
            //console.info("Cpu::loadVideoRom");

            var _this = this;

            var _load = function (resolve, reject)
            {
                // Initialize Graphics
                Gfx.setupGraphics(document.getElementById('gfx-port'), _this,
                    function () {
                        resolve();
                    }
                );
            };

            return new Promise(_load);
        },

        /**
         * Clear CPU Registers
         *
         * @returns {Promise}
         */
        clearRegisters : function()
        {
            //console.info("Cpu::clearRegisters");

            var _this = this;

            var _clear = function (resolve, reject)
            {
                _cpu.clearRegisters();

                resolve();
            };

            return new Promise(_clear);
        },

        /**
         * Clear CPU cache
         *
         * @returns {Promise}
         */
        clearCache : function()
        {
            //console.info("Cpu::clearCache");

            var _this = this;

            var _clear = function (resolve, reject)
            {
                // No CPU caching currently implemented
                resolve();
            };
            return new Promise(_clear);
        },

        /**
         * Run CPU self-tests
         *
         * @returns {Promise}
         */
        selfTest : function()
        {
            //console.info("Cpu::selfTest");

            var _this = this;

            var _test = function (resolve, reject)
            {
                // Self tests not implemented
                resolve();
            };

            return new Promise(_test);
        },

        /**
         * Jump CPU to BIOS entry point
         *
         * @returns {Promise}
         */
        jumpToBios : function()
        {
            //console.info("Cpu::jumpToBios");

            var _this = this;

            var _jump = function (resolve, reject)
            {
                // If this run is blob-type load the blob that should have
                // previously been set
                //SettingsModel.get('emuSettings')['startInDebug']

                if ("blob" === SettingsModel.get('emuSettings')["run-type"])
                {
                    _cpu.loadBinary(SettingsModel.get('emuSettings')["blobSettings"]["address"], _this._blob);
                }

                _cpu.initIP();

                resolve();
            };

            return new Promise(_jump);
        },

        initState : function ()
        {
            //console.info("Cpu::initState");

            var _this = this;

            var _init = function (resolve, reject)
            {
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

                resolve();
            };

            return new Promise(_init);
        },

        // Emulation loop
        run : function (cyclesToRun)
        {
            var _this = Cpu;

            var cyclesToRun = cyclesToRun || null;

            _this.state = this.STATE_RUNNING;

            var _lastCPSCheck = {
                cycles : 0,
                time   : (new Date()).getTime()
            };

            //debugger;

            // Run forever if numCycles is null else run for numCycles
            while (cyclesToRun === null || cyclesToRun-- > 0)
            {
                if (_this._haltFlag || _this.state === _this.STATE_STOPPED){
                    Gfx.drawGraphics();
                    break;
                }

                if (_this.state === _this.STATE_PAUSED)
                {
                    break;
                }

                // Emulate one cycle
                _cpu.emulateCycle();

                _this._cycles++;

                // Every 1000 cycles check the cycles-per-second
                if (0 == _this._cycles % 1000)
                {
                    // Calculate new CPS
                    var now = (new Date()).getTime()
                    var timeDelta   = now - _lastCPSCheck.time;
                    var cycleDelta  = _this._cycles - _lastCPSCheck.cycles;
                    var cps         = cycleDelta / (timeDelta / 1000);
                    var MHz         = cps / 1000000;

                    // Update state
                    _lastCPSCheck = {
                        cycles : _this._cycles,
                        time   : (new Date()).getTime(),
                        cps    : cps
                    };

                    //console.log("CPS: " + cps);

                    if (cps > this.CYCLE_CHECK_INTERVAL)
                    {
                        console.log(cycleDelta + " cycles in " + timeDelta + " milliseconds [" + MHz + " MHz]");
                        console.warn("OMG!!! Slow down");

                        _this.pause();

                        window.setTimeout(Cpu.run, this.SLOWDOWN_WAIT_TIME);

                        break;
                    }
                }
                // TODO: This is wrong! Research the correct timing
                //if (0 === _this._cycles % 100) _this._drawFlag = true;

                // If the draw flag is set, update the screen
                if(_this._drawFlag)
                {
                    Gfx.drawGraphics();
                    _this._drawFlag = false;
                }

                // Store key press state (Press and Release)
                Input.setKeys();


                if (cyclesToRun === null &&
                    _this._debugFlag &&
                    !_this._haltFlag)
                {
                    _this.pause();
                    break;
                }
            }
        },

        getIP : function ()
        {
            return _cpu._regIP;
        },

        getIPMemPos : function ()
        {
            return _cpu.segment2absolute(_cpu._regCS, _cpu._regIP);
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


