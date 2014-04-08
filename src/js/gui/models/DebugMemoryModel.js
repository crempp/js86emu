/**
 * GUI Memory data model
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "underscore",
    "backbone",
    "gui/models/PadMixin",
    "emu/cpu"],
function(
    _,
    Backbone,
    PadMixin,
    Cpu)
{
    var RegisterModel = Backbone.Model.extend(
        _.extend({}, PadMixin, {

            defaults : {
                memory : null,
                rows    : [],
                numRows : 5,
                numCols : 8,
                from    : null,
                to      : null,
                center  : null,
                ip      : 0x00
            },

            initialize: function(initialVales) {
                this.set(initialVales);

                this.center(this.get('center'));
            },

            center : function (centerAddr)
            {
                if ('undefined' !== typeof centerAddr)
                {
                    this.set({'center' : centerAddr});
                }

                // Refresh the IP
                this.set({'ip' : Cpu.getIP()});

                var numCols = this.get('numCols'),
                    numRows = this.get('numRows');

                // Use the center value if set, otherwise use IP
                var center;
                if (null !== this.get('center'))
                {
                    center = this.get('center');
                }
                else
                {
                    center = this.get('ip');
                }

                this.set({'from' : center - (numCols * 2)});
                this.set({'to'   : center + (numCols * 2) + (numRows - 1)});
            },

            updateRows : function () {
                // Refresh our view of the memory
                this.set({'memory' : Cpu.getMemoryBlock()});

                var rows = [];
                for (var i = 0; i < this.get('numRows'); i++)
                {
                    rows[i] = this.get('from') + (this.get('numCols') * i);
                }

                this.set({'rows' : rows});
            }
        }));

    return RegisterModel;
});