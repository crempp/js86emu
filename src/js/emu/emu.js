/**
 * Emulator manager
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "emu/cpu",
    "emu/bios"
],
function(
    Cpu,
    Bios
)
{
    var _error = function(error)
    {
        console.error(error.message);
        console.log(error.stack);
    };

    // Load xtbios.bin to FE00:0000
    // Load et4000.bin to C000:0000
    // (http://www.dreamincode.net/forums/topic/231628-fake86-an-8086-pc-emulator-project/page__st__15)
    var Emu = {

        pre_boot : function()
        {
            var _pre_boot = function (resolve, reject)
            {
                // Configure the CPU and load ROMs
                Cpu.configure()
                    .then(function(){return Cpu.clearMemory();}, _error)
                    .then(function(){return Cpu.loadBiosRom();}, _error)
                    .then(function(){return Cpu.loadVideoRom();}, _error)
                    .then(function(){resolve();}, _error);
            }

            return new Promise(_pre_boot);
        },

        boot : function ()
        {
            var _boot = function (resolve, reject)
            {
                Cpu._haltFlag = false;

                Cpu.clearRegisters()
                    .then(function(){return Cpu.clearCache();}, _error)
                    .then(function(){return Cpu.selfTest();}, _error)
                    .then(function(){return Cpu.jumpToBios();}, _error)
                    .then(function(){return Cpu.initState();}, _error)
                    .then(function(){resolve();}, _error);
            }

            return new Promise(_boot);
        },

        run : function ()
        {
            var _this = this;
            this.pre_boot()
                .then(function(){
                    return _this.boot();
                }, _error)
                .then(function(){
                    Cpu.run();
                }, _error);
        },

        reset : function ()
        {
            if (Cpu.state === Cpu.STATE_RUNNING)
            {
                Cpu.halt();
            }

            Cpu.reset();
        },

        pause : function ()
        {
            Cpu.pause();
        },

        halt : function ()
        {
            Cpu.halt();
        },

        step : function ()
        {
            Cpu.step();
        },

        runBlob : function (blob)
        {
            Cpu.setBinary(blob);
            this.run();
        },

        isDebug : function ()
        {
            return Cpu.isDebug();
        }
    };

    return Emu;
});