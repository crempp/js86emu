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
 * Emulator CPU tests
 */
describe('Emu.Cpu', function () {

    var mockCPU;

    before(function(){
        // TODO: Load the CPU module
    });

    it.skip('should configure', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.configure();
    });

    it.skip('should clear memory', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.clearMemory();
    });

    it.skip('should load BIOS ROM', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.loadBiosRom();
    });

    it.skip('should load video ROM', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.loadVideoRom();
    });

    it.skip('should clear registers', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.clearRegisters();
    });

    it.skip('should clear CPU cache', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.clearCache();
    });

    it.skip('should self test', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.selfTest();
    });

    it.skip('should jump to BIOS address', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.jumpToBios();
    });

    it.skip('should init CPU state', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.initState();
    });

    it.skip('should run', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.run();
    });

    it.skip('should return IP', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.getIP();
    });

    it.skip('should set binary blob', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.setBinary();
    });

    it.skip('should reset CPU', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.reset();
    });

    it.skip('should pause CPU', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.pause();
    });

    it.skip('should halt CPU', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.halt();
    });

    it.skip('should step CPU one instruction', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.step();
    });

    it.skip('should toggle debug state', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.toggleDebug();
    });

    it.skip('should allow debug to be enabled', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.enableDebug();
    });

    it.skip('should allow debug to be disabled', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.disableDebug();
    });

    it.skip('should return debug state', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.isDebug();
    });

    it.skip('should set memory block', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.setMemoryBlock();
    });

    it.skip('should return memory block', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.getMemoryBlock();
    });

    it.skip('should return 8 bits of memory', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.getMem8();
    });

    it.skip('should return 16 bits of memory', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.getMem16();
    });

    it.skip('should update decode debug interface', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.debugUpdateDecode();
    });

    it.skip('should update register debug interface', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.debugUpdateRegister();
    });

    it.skip('should update memory debug interface', function() {
        // TODO: Write test
        false.should.be.true;
        // mockCPU.debugUpdateMemory();
    });

});