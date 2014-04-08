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
            var memModel = new DebugMemoryModel({
                numRows : 5,
                numCols : 8
            });
            var debugMemoryView = new DebugMemoryView({model: memModel});
            $("#gui-debug-memory").html(debugMemoryView.render().el);
        }

//        handleVidTest : function ()
//        {
//            gfx.debugVideoTestPattern();
//            gfx.drawGraphics();
//        },
    };

    return GUI;
});


