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

        run : function ()
        {
            // Boot the CPU
            Cpu.boot();
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