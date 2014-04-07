/**
 * Emulator manager
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "emu/cpu"
],
function(
    Cpu
)
{
    var Emu = {

        run : function  (settings)
        {
            // Enable debugging
            //Cpu.toggleDebug();

            // Boot the CPU
            Cpu.boot(settings);
        },

        reset : function ()
        {
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

        runBlob : function (settings, blob)
        {
            Cpu.setBinary(blob);
            this.run(settings);
        }
    };

    return Emu;
});