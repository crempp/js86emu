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
    "config/config",
    "gui/views/ModalView",
    "gui/templates/GuiTemplate",
    "gui/models/SettingsModel"],
function(
    $,
    _,
    Backbone,
    Config,
    ModalView,
    GuiTemplate,
    SettingsModel)
{
    var SettingsView = ModalView.extend({
        id : "modalContent-settings",

        template : GuiTemplate['SettingsTemplate'],

        initialize : function (options) {
            console.log("In SettingsView:initialize()");
            this.config = Config;

            console.log(this.config.definition);
            console.log(this.config.definition.test);

            this.model = SettingsModel;
            ModalView.prototype.initialize.call(this, options);
        },

        events: function(){
            return _.extend({},ModalView.prototype.events,{
                'click .modal-settings-tab' : 'onTabClick'
            });
        },

        selectTab : function (name) {
            // Deactivate all windows
            this.$el.find(".modal-settings-window").removeClass('active');

            // Deactivate all tabs
            this.$el.find(".modal-settings-tab").removeClass('selected');

            // Select new tab
            this.$el.find(".modal-settings-tab[data-setting-window='" + name + "']").addClass('selected');

            // Activate new window
            this.$el.find(".modal-settings-window[data-setting-window='" + name + "']").addClass('active');
        },

        onTabClick : function (event) {
            this.selectTab(event.target.dataset.settingWindow)
        }
    });

    return SettingsView;
});