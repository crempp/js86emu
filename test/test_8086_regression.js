/**
 * Test the 8086 CPU
 *
 * Tests through out this file make referece to "The 8086 Family User Guide."
 * These references look like:
 *   T8086FUM 2-45
 * which refers to page 2-45 of the manual.
 */
var path = require('path');
var requirejs = require('requirejs');
var assert = require("assert")
var should = require('should');
var deepcopy = require('deepcopy');
var u = require('./utils');

// Minimal configuration of require.js for this test run
requirejs.config({
    baseUrl: path.normalize(__dirname + "/../src/js"),
    nodeRequire: require,
});

/**
 * Emulator tests
 */
describe('Emu.Cpu.8086.regression', function () {

    // Setup the CPU
    var cpu8086,
        cpuClean; // a fresh CPU for resetting the cpu8086


    before("CPU Setup", function (done) {
        // Load the CPU module using require.js
        requirejs(['emu/cpus/8086'], function (_File) {
            cpu8086 = _File;

            // Configure
            cpu8086.configure(u.buildCPUMock(), u.buildSettingsMock(), u.buildGUIMock());

            // Save a clean version of the CPU so we can clone it when
            // we need another CPU
            cpuClean = deepcopy(cpu8086);

            done();

        });
    });

    /**
     * Initialization Tests
     */
    describe('Short jump IP bug', function() {
        var tmp_cpu;
        var tmp_settings;

        beforeEach(function () {
            tmp_cpu = deepcopy(cpuClean);
            tmp_settings = u.buildSettingsMock();

            tmp_cpu.configure(u.buildCPUMock(), tmp_settings, u.buildGUIMock());
            tmp_cpu.initializeMemory();
            tmp_cpu.initializePorts();
            tmp_cpu.clearMemory();
            tmp_cpu.clearRegisters();

        });

        it('short jump should incrememt IP by two even if negative offset', function () {
            // Set the IP
            tmp_cpu.initIP(0x0164); // 356

            // Set the next instruction to be a JNZ with an offset of -14
            tmp_cpu._memoryV[cpu8086.segment2absolute(cpu8086._regCS, 0x164)] = 0x75;
            tmp_cpu._memoryV[cpu8086.segment2absolute(cpu8086._regCS, 0x165)] = 0xF2;

            tmp_cpu.emulateCycle();

            tmp_cpu._regIP.should.equal(0x0158); // 344

        });
    });
});