/**
 * Provides emulator gui module and classes
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/views/ControlView",
    "gui/views/DebugDecodeView",
    "gui/views/DebugRegisterView",
    "gui/views/DebugMemoryView",
    "gui/models/DebugDecodeModel",
    "gui/models/DebugRegisterModel",
    "gui/models/DebugMemoryModel"],
function(
    $,
    _,
    backbone,
    ControlView,
    DebugDecodeView,
    DebugRegisterView,
    DebugMemoryView,
    DebugDecodeModel,
    DebugRegisterModel,
    DebugMemoryModel
    )
{

    var GUI = {
        _debugToConsole : true,

        _memCenter : 0,

        _controlView : null,

        init : function ()
        {
            this._controlView = new ControlView();
            $("#gui-controls").append(this._controlView.render().el);
        },

        debugUpdateDecode : function (decObj)
        {
            var decModel = new DebugDecodeModel(decObj);
            var debugDecodeView = new DebugDecodeView({model: decModel});
            $("#gui-debug-decode").html(debugDecodeView.render().el);
        },

        debugUpdateRegister : function (regObj)
        {
            var regModel = new DebugRegisterModel(regObj);
            var debugRegisterView = new DebugRegisterView({model: regModel});
            $("#gui-debug-register").html(debugRegisterView.render().el);
        },

        debugUpdateMemory : function (memObj)
        {
            var debugMemoryView = new DebugMemoryView({model: memObj});
            $("#gui-debug-memory").html(debugMemoryView.render().el);
        },

        debugCenterMemory : function (address)
        {

        }
//        handleCenterMemoryButton : function ()
//        {
//            // Get address from input (should be in hex)
//            // TODO: validation
//            var addr = $('#debug-memory-center').val();
//
//            // Strip optional "0x" from string
//            addr = addr.replace("0x", "");
//            // Convert from hex to int
//            addr = parseInt(addr, 16);
//
//            this.centerMemoryDisplay(addr);
//            this.displayMemory();
//        },
//
//        handleVidTest : function ()
//        {
//            gfx.debugVideoTestPattern();
//            gfx.drawGraphics();
//        },
//
//        centerMemoryDisplay : function (center)
//        {
//            this._memCenter = center;
//        },
//
//        displayMemory : function ()
//        {
//            var $tbody = $('#debug-memory-table tbody');
//            var content = "";
//
//            // reset
//            $tbody.html('');
//
//            // Start (2 * 4) bytes before IP
//            var currAddr8 = this._memCenter - (2 * 4);
//
//            var currIP = cpu.getIP();
//
//            for (var i = 0; i < 5; i++)
//            {
//                var rangeStart = "--",
//                    rangeEnd = "--",
//                    v1 = "--",
//                    v2 = "--",
//                    v3 = "--",
//                    v4 = "--",
//                    v1Class = "", v2Class = "", v3Class = "", v4Class = "";
//
//                if (currAddr8 >= 0)
//                {
//                    v1 = this._padHexByte(cpu.getMem8(currAddr8));
//                    rangeStart = this._padHexWord(currAddr8)
//                }
//                if (currAddr8 + 1 >= 0)
//                    v2 = this._padHexByte(cpu.getMem8(currAddr8 + 1));
//
//                if (currAddr8 + 2 >= 0)
//                    v3 = this._padHexByte(cpu.getMem8(currAddr8 + 2));
//
//                if (currAddr8 + 3 >= 0)
//                {
//                    v4 = this._padHexByte(cpu.getMem8(currAddr8 + 3));
//                    rangeEnd = this._padHexWord(currAddr8 + 3);
//                }
//
//                if      (currIP === (currAddr8)) v1Class = "debug-memory-IP";
//                else if (currIP === (currAddr8 + 1)) v2Class = "debug-memory-IP";
//                else if (currIP === (currAddr8 + 2)) v3Class = "debug-memory-IP";
//                else if (currIP === (currAddr8 + 3)) v4Class = "debug-memory-IP";
//
//                content += "<tr class='debug-memory-row'>";
//                content += "    <td class='debug-memory-addr'>" + rangeStart + " - " + rangeEnd + "</td>";
//                content += "    <td class='debug-memory-value " + v1Class + "'>" + v1 + "</td>";
//                content += "    <td class='debug-memory-value " + v2Class + "'>" + v2 + "</td>";
//                content += "    <td class='debug-memory-value " + v3Class + "'>" + v3 + "</td>";
//                content += "    <td class='debug-memory-value " + v4Class + "'>" + v4 + "</td>";
//                content += "</tr>";
//
//                currAddr8 += 4;
//            }
//
//            $tbody.html(content);
//        },
    };

    return GUI;
});


