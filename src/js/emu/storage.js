/**
 *
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([],
function()
{
    var Storage = {
        handleSelectedDiskImg : function (evt)
        {
            var file = evt.target.files[0]; // FileList object
            var reader = new FileReader();

            document.getElementById("file_chooser_output").innerHTML = file.name;

            reader.onload = function(e) {
                //cpu.loadBinary(0x0110, reader.result);
                cpu.loadBinary(0xF000, reader.result);
            };

            reader.onerror = function(event) {
                console.error("File could not be read! Code " + event.target.error.code);
            };

            reader.readAsArrayBuffer(file);
        },

        load : function ()
        {
        /*
            var oBuilder = new BlobBuilder();
            var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
            oBuilder.append(aFileParts[0]);
            var oMyBlob = oBuilder.getBlob('text/xml'); // the blob
        */

        }
    };

    return Storage;
});
