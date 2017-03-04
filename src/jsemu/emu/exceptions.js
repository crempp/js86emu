/**
 * Emulator Exceptions
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([], function()
{
    var Exceptions = {
        MemoryBinaryTooLarge : function (size) {
            this.name = "MemoryBinaryTooLarge";
            this.message = "Attempted to load " + size + " bytes into memory, binary too large.";
            this.value = size;
            this.toString = function() {
               return "[" + this.name + "] " + this.message
            };
        }

    }

    return Exceptions;
});