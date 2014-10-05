/**
 * Data load utility
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */

define([], function() {
    /**
     * Data Loader Class
     *
     * @param location
     * @param chunked
     * @param buffered
     * @private
     */
    var _Loader = function(location, chunked, buffered)
    {
        this.location = location;
        this.chunked = chunked || false;
        this.buffered = buffered || false;
        this.events = {};
    };
    _Loader.prototype.constructor = _Loader;

    _Loader.prototype.load = function()
    {
        var _this = this;
        var oReq = new XMLHttpRequest();

        oReq.open("GET", this.location, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText

            if (_this.events.hasOwnProperty("load") &&
                "function" === typeof _this.events["load"])
            {
                _this.events["load"](arrayBuffer);
            }
        };

        oReq.send(null);
        return this;
    };

    _Loader.prototype.on = function(name, onLoad)
    {
        this.events[name] = onLoad;
        return this;
    };

    var _loaderPool = [];

    var DataLoader = {
        /**
         * Create a data loader and add to pool
         *
         * @param location
         * @param chunked
         * @param buffered
         * @returns {*}
         */
        create: function(location, chunked, buffered)
        {
            _loader = new _Loader(location, chunked, buffered);
            _loaderPool.push(_loader);
            return _loader;
        }
    };

    return DataLoader;
})