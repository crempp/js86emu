var path = require('path');
var requirejs = require('requirejs');
var assert = require("assert")
var should = require('should');
var u = require('./utils');

// Minimal configuration of require.js for this test run
requirejs.config({
    baseUrl: path.normalize(__dirname + "/../src/js"),
    nodeRequire: require,
});


/**
 * Emulator tests
 */
describe('Emu', function () {

    var mockEmu;

    before(function(){
        // TODO: Load the Emu module
    });

    it.skip('should run pre-boot steps', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.loadBiosRom();
    });

    it.skip('should boot CPU', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.boot();
    });

    it.skip('should run emulation', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.run();
    });

    it.skip('should reset the CPU state', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.reset();
    });

    it.skip('should pause emulation', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.pause();
    });

    it.skip('should halt emulation', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.halt();
    });

    it.skip('should step one instruction', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.step();
    });

    it.skip('should run a binary program', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.runBlob();
    });

    it.skip('should return debug state', function() {
        // TODO: Write test
        false.should.be.true;
        // mockEmu.isDebug();
    });

});