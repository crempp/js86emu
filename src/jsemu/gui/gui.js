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
    "gui/views/DebugInfoView",
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
    DebugInfoView,
    DebugDecodeModel,
    DebugRegisterModel,
    DebugMemoryModel
    )
{

    var GUI = {
        _debugToConsole : true,

        _memCenter : 0,

        _controlView : null,

        _debugInfoView     : null,
        _debugDecodeView   : null,
        _debugRegisterView : null,
        _debugMemoryView   : null,

        init : function ()
        {
            this._controlView = new ControlView();
            $("#gui-controls").append(this._controlView.render().el);
        },

        setControlState : function (state)
        {
            this._controlView.setState(state);
        },

        debugUpdateInfo : function (data)
        {
            this._debugInfoView = new DebugInfoView(data);
            $("#gui-debug-info").html(this._debugInfoView.render().el);
        },

        debugUpdateDecode : function (decObj)
        {
            var decModel = new DebugDecodeModel(decObj);
            this._debugDecodeView = new DebugDecodeView({model: decModel});
            $("#gui-debug-decode").html(this._debugDecodeView.render().el);
        },

        debugUpdateRegister : function (regObj)
        {
            var regModel = new DebugRegisterModel(regObj);
            this._debugRegisterView = new DebugRegisterView({model: regModel});
            $("#gui-debug-register").html(this._debugRegisterView.render().el);
        },

        debugUpdateMemory : function (memObj)
        {
            var memModel = new DebugMemoryModel({
                numRows : 5,
                numCols : 8
            });
            this._debugMemoryView = new DebugMemoryView({model: memModel});
            $("#gui-debug-memory").html(this._debugMemoryView.render().el);
        },

        disableDebug : function ()
        {
            this._debugInfoView.disable();
            this._debugDecodeView.disable();
            this._debugRegisterView.disable();
            this._debugMemoryView.disable();
        }
    };

    return GUI;
});


