/**
* String padding mixin
*
* @module GUI
* @author Chad Rempp <crempp@gmail.com>
*/

define([],
function()
{
    var PadMixin = {
        _padBinary : function(val, num)
        {
            return String((new Array(num + 1).join("0")) + val.toString(2)).slice(-1 * num);
        },
        _padBinaryByte : function (val)
        {
            return String("00000000" + val.toString(2)).slice(-8);
        },
        _padBinaryWord : function (val)
        {
            return String("0000000000000000" + val.toString(2)).slice(-16);
        },
        _padHexByte : function (val)
        {
            return "0x" + String("00" + val.toString(16)).slice(-2);
        },
        _padHexWord : function (val)
        {
            return "0x" + String("0000" + val.toString(16)).slice(-4);
        }
    };

    return PadMixin;
});