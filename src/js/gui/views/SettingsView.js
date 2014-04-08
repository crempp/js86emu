/**
 * GUI control view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/views/ModalView",
    "gui/templates/GuiTemplate"],
function(
    $,
    _,
    Backbone,
    ModalView,
    GuiTemplate)
{
    var SettingsView = ModalView.extend({
        id : "modalContent-settings",

        template: GuiTemplate['SettingsTemplate']
    });

    return SettingsView;
});