/**
 * Emulator manager
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "emu/cpu",
    "emu/bios",
],
function(
    Cpu,
    Bios
)
{
    var Emu = {

        run : function ()
        {
            Cpu._debugFlag = false;
            if (Cpu.state === Cpu.STATE_PAUSED)
            {
                Cpu.run();
            }
            else
            {
                Cpu.boot();
            }
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