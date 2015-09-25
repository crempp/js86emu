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
describe('Emu.Cpu.8086', function () {

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
    describe('Cpu Intialization', function(){
        var tmp_cpu;
        var tmp_settings;

        beforeEach(function(){
            tmp_cpu = deepcopy(cpuClean);
            tmp_settings = u.buildSettingsMock();

            tmp_cpu.configure(u.buildCPUMock(), tmp_settings, u.buildGUIMock());
            tmp_cpu.initializeMemory();
            tmp_cpu.initializePorts();
            tmp_cpu.clearMemory();
            tmp_cpu.clearRegisters();

        });

        it('should configure', function() {
            // The CPU was configured in the beforeEach()
            tmp_cpu.t_getSetting("address").should.be.equal(tmp_settings["address"]);
            tmp_cpu.t_getSetting("use-bios").should.be.equal(tmp_settings["use-bios"]);
            tmp_cpu.t_getSetting("file").should.be.equal(tmp_settings["file"]);
            tmp_cpu.t_getSetting("id").should.be.equal(tmp_settings["id"]);
            tmp_cpu.t_getSetting("name").should.be.equal(tmp_settings["name"]);
            tmp_cpu.t_getSetting("selected").should.be.equal(tmp_settings["selected"]);
            // Use .eql for an object, how deep does this go?
            tmp_cpu.t_getSetting("cpu-init").should.be.eql(tmp_settings["cpu-init"]);
        });

        it('should initialize memory', function() {
            tmp_cpu._memory.should.be.an.instanceOf(ArrayBuffer);
            tmp_cpu._memoryV.should.be.an.instanceOf(Uint8Array);
            tmp_cpu._memoryV.length.should.equal(1048576);
        });

        it('should clear registers', function() {
            // Assign identifying values to registers
            u.setRegisterIdent(cpu8086);

            // now clear the registers
            tmp_cpu.clearRegisters();

            // Verify
            // clearing registers doesn't necessarily set them to 0,
            // it sets them to the values defined in the settings.
            tmp_cpu._regAH.should.equal(tmp_settings["cpu-init"]["registers"]["ah"]);
            tmp_cpu._regAL.should.equal(tmp_settings["cpu-init"]["registers"]["al"]);
            tmp_cpu._regBH.should.equal(tmp_settings["cpu-init"]["registers"]["bh"]);
            tmp_cpu._regBL.should.equal(tmp_settings["cpu-init"]["registers"]["bl"]);
            tmp_cpu._regCH.should.equal(tmp_settings["cpu-init"]["registers"]["ch"]);
            tmp_cpu._regCL.should.equal(tmp_settings["cpu-init"]["registers"]["cl"]);
            tmp_cpu._regDH.should.equal(tmp_settings["cpu-init"]["registers"]["dh"]);
            tmp_cpu._regDL.should.equal(tmp_settings["cpu-init"]["registers"]["dl"]);
            tmp_cpu._regSI.should.equal(tmp_settings["cpu-init"]["registers"]["si"]);
            tmp_cpu._regDI.should.equal(tmp_settings["cpu-init"]["registers"]["di"]);
            tmp_cpu._regBP.should.equal(tmp_settings["cpu-init"]["registers"]["bp"]);
            tmp_cpu._regSP.should.equal(tmp_settings["cpu-init"]["registers"]["sp"]);
            tmp_cpu._regIP.should.equal(tmp_settings["cpu-init"]["registers"]["ip"]);
            tmp_cpu._regCS.should.equal(tmp_settings["cpu-init"]["registers"]["cs"]);
            tmp_cpu._regDS.should.equal(tmp_settings["cpu-init"]["registers"]["ds"]);
            tmp_cpu._regES.should.equal(tmp_settings["cpu-init"]["registers"]["es"]);
            tmp_cpu._regSS.should.equal(tmp_settings["cpu-init"]["registers"]["ss"]);
            tmp_cpu._regFlags.should.equal(tmp_settings["cpu-init"]["registers"]["flags"]);
        });

        it('should initialize instruction pointer', function() {

            // Should be able to pass explicit value
            tmp_cpu.initIP(0x1234);
            tmp_cpu._regIP.should.equal(0x1234);

            // Should read from settings
            tmp_cpu.initIP();
            tmp_cpu._regIP.should.equal(tmp_settings["cpu-init"]["registers"]["ip"]);

            // Should read from bios address
            var tmp_tmp_cpu = deepcopy(cpuClean);
            var tmp_tmp_settings = u.buildSettingsMock();
            tmp_tmp_settings['use-bios'] = true;
            tmp_tmp_cpu.configure(u.buildCPUMock(), tmp_tmp_settings, u.buildGUIMock());
            tmp_tmp_cpu.clearRegisters();

            tmp_tmp_cpu.initIP();
            tmp_tmp_cpu._regIP.should.equal(tmp_cpu.bios_rom_address);
        });

        it('should clear memory', function() {
            // Set some values in memory
            u.setMemoryIdent(tmp_cpu);

            // Clear the memory
            tmp_cpu.clearMemory()

            // All memory locations should be set to 0 (all memory
            // locations should sum to 0
            var memSum = 0;
            for (var i = 0; i < tmp_cpu._memoryV.length; i++)
            {
                memSum += tmp_cpu._memoryV[i];
            }

            memSum.should.equal(0);
        });

        it('should load binary', function() {
            var blob;
            // Should be able to load a blob the size of ram
            tmp_cpu.clearMemory();
            blob = new Uint8Array(tmp_cpu._memoryV.length);
            for (var i = 0; i <= tmp_cpu._memoryV.length; i += 1)
            {
                blob[i] = 0x01;
            }

            tmp_cpu.loadBinary(0x00, blob);

            // All memory locations should be set to 1 (all memory
            // locations should sum to _memoryV.length
            var memSum = 0;
            for (var i = 0; i < tmp_cpu._memoryV.length; i++)
            {
                memSum += tmp_cpu._memoryV[i];
            }

            memSum.should.equal(tmp_cpu._memoryV.length);

            // Over sized blobs should throw exceptions
            tmp_cpu.clearMemory();
            blob = new Uint8Array(tmp_cpu._memoryV.length + 1);
            for (var i = 0; i <= tmp_cpu._memoryV.length + 1; i += 1)
            {
                blob[i] = 0x01;
            }

            tmp_cpu.loadBinary.bind(tmp_cpu, 0x00, blob).should.throw(
                "Attempted to load 1048577 bytes into memory, binary too large."
            );

            // Should be able to set blob to arbitrary locations of
            // memory
            tmp_cpu.clearMemory();
            var blob = new Uint8Array(2);
            blob[0] = 0x10;
            blob[1] = 0x20;

            tmp_cpu.loadBinary(0x55, blob);

            tmp_cpu._memoryV[0x55].should.equal(0x10);
            tmp_cpu._memoryV[0x56].should.equal(0x20);

        });
    });

    /**
     * CPU Utility Tests
     */
    describe('Cpu utilities', function() {
        // 2-Byte register shortcuts
        var _regAX = function(){return ((cpu8086._regAH << 8) | cpu8086._regAL)};
        var _regBX = function(){return ((cpu8086._regBH << 8) | cpu8086._regBL)};
        var _regCX = function(){return ((cpu8086._regCH << 8) | cpu8086._regCL)};
        var _regDX = function(){return ((cpu8086._regDH << 8) | cpu8086._regDL)};

        // memory getter shortcut
        var m8 = function(a){return cpu8086._memoryV[a];};
        var m16 = function(a){return ((cpu8086._memoryV[a + 1] << 8) | cpu8086._memoryV[a]);};

        before(function(){
            cpu8086.initializeMemory();
            cpu8086.initializePorts();
        });

        beforeEach(function(){
            // Assign identifying values to registers
            cpu8086.clearRegisters();
            u.setRegisterIdent(cpu8086);

            // Assign identifying values to memory
            cpu8086.clearMemory();
            u.setMemoryIdent(cpu8086, cpu8086._memoryV.length);
        });

        /* T8086FUM 4.20 */
        it('should return register value based on opcode <_getRegValueForOp>', function () {
            // w=0, reg = 000
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00000000")))
                .should.equal(cpu8086._regAL);
            // w=0, reg = 001
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00001000")))
                .should.equal(cpu8086._regCL);
            // w=0, reg = 010
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00010000")))
                .should.equal(cpu8086._regDL);
            // w=0, reg = 011
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00011000")))
                .should.equal(cpu8086._regBL);
            // w=0, reg = 100
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00100000")))
                .should.equal(cpu8086._regAH);
            // w=0, reg = 101
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00101000")))
                .should.equal(cpu8086._regCH);
            // w=0, reg = 110
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00110000")))
                .should.equal(cpu8086._regDH);
            // w=0, reg = 111
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00111000")))
                .should.equal(cpu8086._regBH);
            // w=1, reg = 000
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00000000")))
                .should.equal(((cpu8086._regAH<<8)|cpu8086._regAL));
            // w=1, reg = 001
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00001000")))
                .should.equal(((cpu8086._regCH<<8)|cpu8086._regCL));
            // w=1, reg = 010
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00010000")))
                .should.equal(((cpu8086._regDH<<8)|cpu8086._regDL));
            // w=1, reg = 011
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00011000")))
                .should.equal(((cpu8086._regBH<<8)|cpu8086._regBL));
            // w=1, reg = 100
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00100000")))
                .should.equal(cpu8086._regSP);
            // w=1, reg = 101
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00101000")))
                .should.equal(cpu8086._regBP);
            // w=1, reg = 110
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00110000")))
                .should.equal(cpu8086._regSI);
            // w=1, reg = 111
            cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00111000")))
                .should.equal(cpu8086._regDI);
        });

        /* T8086FUM 4.20 */
        it('should return register/memory based on opcode <_getRMValueForOp>', function () {
            // TODO: Does this addressing ever care about the 'd' bit?
            // NOTE: the _getRMValueForOp helper returns the *value* at the
            // calculated address, not the address. However for testing
            // purposes the values have been set to the address for simplicity.

            var disp8, disp16;

            // Test the address for both byte and word return values
            // TODO: Does the 8086 actually support different 'w' values in
            // this addressing mode?
            for (var w = 0; w <= 1; w++) {
                // cast w to a string for use in binary number building
                var ws = w.toString();
                var m = (0 === w) ? m8 : m16;

                // R/M Table (no displacement)
                // mod=00, rm=000
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000000")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regSI)));
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=00, rm=001
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000001")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regDI)));
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=00, rm=010
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000010")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regSI)));
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=00, rm=011
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000011")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regDI)));
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=00, rm=100
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000100")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regSI)));
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=00, rm=101
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000101")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regDI)));
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=00, rm=110
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000110")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regIP + 2)))));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=00, rm=111
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("00000111")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX())));
                cpu8086.t_getTmpIPAndReset().should.equal(0);

                // R/M Table (with byte displacement)
                disp8 = cpu8086._memoryV[cpu8086._regIP + 2];
                // mod=01, rm=000
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000000")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regSI + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=001
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000001")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regDI + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=010
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000010")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regSI + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=011
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000011")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regDI + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=100
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000100")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regSI + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=101
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000101")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regDI + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=110
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000110")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + +disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                // mod=01, rm=111
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("01000111")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + disp8)));
                cpu8086.t_getTmpIPAndReset().should.equal(1);

                // R/M Table (with byte displacement)
                disp16 = ( (cpu8086._memoryV[cpu8086._regIP + 3] << 8) | cpu8086._memoryV[cpu8086._regIP + 2] );
                // mod=10, rm=000
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000000")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regSI + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=001
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000001")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regDI + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=010
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000010")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regSI + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=011
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000011")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regDI + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=100
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000100")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regSI + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=101
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000101")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regDI + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=110
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000110")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + +disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                // mod=10, rm=111
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000111")))
                    .should.equal(m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + disp16)));
                cpu8086.t_getTmpIPAndReset().should.equal(2);

                // Reg Table
                // mod=11, rm=000
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000000")))
                    .should.equal((w === 0) ? cpu8086._regAL : _regAX());
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=001
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000001")))
                    .should.equal((w === 0) ? cpu8086._regCL : _regCX());
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=010
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000010")))
                    .should.equal((w === 0) ? cpu8086._regDL : _regDX());
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=011
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000011")))
                    .should.equal((w === 0) ? cpu8086._regBL : _regBX());
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=100
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000100")))
                    .should.equal((w === 0) ? cpu8086._regAH : cpu8086._regSP);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=101
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000101")))
                    .should.equal((w === 0) ? cpu8086._regCH : cpu8086._regBP);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=110
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000110")))
                    .should.equal((w === 0) ? cpu8086._regDH : cpu8086._regSI);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                // mod=11, rm=111
                cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000111")))
                    .should.equal((w === 0) ? cpu8086._regBH : cpu8086._regDI);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
            }

        });

        /* T8086FUM 4.20 */
        it('should set register value based on opcode <_setRegValueForOp>', function () {
            // These tests set the register values to 0xFF or 0xFFFF. This
            // value is used because the setRegisterIdent() function does not
            // use those values.
            // TODO: Does this addressing ever care about the 'd' bit?

            // Reg Table
            // w=0, reg=000
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00000000")), 0xFF);
            cpu8086._regAL.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=001
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00001000")), 0xFF);
            cpu8086._regCL.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=010
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00010000")), 0xFF);
            cpu8086._regDL.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=011
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00011000")), 0xFF);
            cpu8086._regBL.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=100
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00100000")), 0xFF);
            cpu8086._regAH.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=101
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00101000")), 0xFF);
            cpu8086._regCH.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=110
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00110000")), 0xFF);
            cpu8086._regDH.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=0, reg=111
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00111000")), 0xFF);
            cpu8086._regBH.should.equal(0xFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);

            // Reg Table
            // w=1, reg=000
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00000000")), 0xFFFF);
            ((cpu8086._regAH << 8) | cpu8086._regAL).should.equal(0xFFFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=001
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00001000")), 0xFFFF);
            ((cpu8086._regCH << 8) | cpu8086._regCL).should.equal(0xFFFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=010
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00010000")), 0xFFFF);
            ((cpu8086._regDH << 8) | cpu8086._regDL).should.equal(0xFFFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=011
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00011000")), 0xFFFF);
            ((cpu8086._regBH << 8) | cpu8086._regBL).should.equal(0xFFFF);
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=100
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00100000")), 0xFFFF);
            cpu8086._regSP.should.equal(0xFFFF); // SP
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=101
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00101000")), 0xFFFF);
            cpu8086._regBP.should.equal(0xFFFF); // BP
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=110
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00110000")), 0xFFFF);
            cpu8086._regSI.should.equal(0xFFFF); // SI
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
            // w=1, reg=111
            cpu8086._setRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00111000")), 0xFFFF);
            cpu8086._regDI.should.equal(0xFFFF); // DI
            cpu8086.t_getTmpIPAndReset().should.equal(0);
            cpu8086.clearRegisters(); u.setRegisterIdent(cpu8086);
        });

        /* T8086FUM 4.20 */
        it('should set register/memory based on opcode <_setRMValueForOp>', function () {
            // TODO: Does this addressing ever care about the 'd' bit?
            // NOTE: we do not want to setMemoryIdent() here because it's
            // easier to ensure the correct memory location is set to 255 if
            // all locations start at 0.

            var disp8, disp16;

            // Test the address for both byte and word return values
            // TODO: Does the 8086 actually support different 'w' values in
            // this addressing mode?
            for (var w = 0; w <= 1; w++) {
                // cast w to a string for use in binary number building
                var ws = w.toString();
                var m = (0 === w) ? m8 : m16;
                var testValue = (0 === w) ? 0xFF : 0xFFFF;

                cpu8086.clearMemory();
                u.setRegisterIdent(cpu8086);

                // R/M Table (no displacement)
                // mod=00, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000000")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regSI)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();
                // mod=00, rm=001
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000001")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regDI)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();
                // mod=00, rm=010
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000010")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regSI)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();
                // mod=00, rm=011
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000011")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regDI)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();
                // mod=00, rm=100
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000100")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regSI)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();
                // mod=00, rm=101
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000101")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regDI)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();
                // mod=00, rm=110
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000110")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regIP + 2)))).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=00, rm=111
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("00000111")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX())).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearMemory();

                // R/M Table (with byte displacement)
                disp8 = cpu8086._memoryV[cpu8086._regIP + 2];
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000000")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regSI + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000001")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regDI + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000010")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regSI + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000011")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regDI + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000100")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regSI + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000101")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regDI + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000110")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + +disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();
                // mod=01, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000" + ws), u.Bin2Hex("01000111")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + disp8)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(1);
                cpu8086.clearMemory();

                // R/M Table (with byte displacement)
                disp16 = ( (cpu8086._memoryV[cpu8086._regIP + 3] << 8) | cpu8086._memoryV[cpu8086._regIP + 2] );
                // mod=10, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000000")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regSI + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=001
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000001")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + cpu8086._regDI + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=010
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000010")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regSI + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=011
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000011")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + cpu8086._regDI + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=100
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000100")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regSI + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=101
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000101")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regDI + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=110
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000110")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regBP + +disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();
                // mod=10, rm=111
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("10000111")), testValue);
                m(cpu8086.segment2absolute(cpu8086._regCS, _regBX() + disp16)).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(2);
                cpu8086.clearMemory();

                // R/M Table (with byte displacement)
                cpu8086.clearRegisters();
                // mod=11, rm=000
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000000")), testValue);
                ((w === 0) ? cpu8086._regAL : ((cpu8086._regAH << 8) | cpu8086._regAL))
                    .should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=001
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000001")), testValue);
                ((w === 0) ? cpu8086._regCL : ((cpu8086._regCH << 8) | cpu8086._regCL))
                    .should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=010
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000010")), testValue);
                ((w === 0) ? cpu8086._regDL : ((cpu8086._regDH << 8) | cpu8086._regDL))
                    .should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=011
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000011")), testValue);
                ((w === 0) ? cpu8086._regBL : ((cpu8086._regBH << 8) | cpu8086._regBL))
                    .should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=100
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000100")), testValue);
                ((w === 0) ? cpu8086._regAH : cpu8086._regSP).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=101
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000101")), testValue);
                ((w === 0) ? cpu8086._regCH : cpu8086._regBP).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=110
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000110")), testValue);
                ((w === 0) ? cpu8086._regDH : cpu8086._regSI).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
                // mod=11, rm=111
                cpu8086._setRMValueForOp(cpu8086._decode(u.Bin2Hex("0000000"+ws), u.Bin2Hex("11000111")), testValue);
                ((w === 0) ? cpu8086._regBH : cpu8086._regDI).should.equal(testValue);
                cpu8086.t_getTmpIPAndReset().should.equal(0);
                cpu8086.clearRegisters();
            }
        });

        it('should calculate the the IP increment for RM addressing <_getRMIncIP>', function () {
            for (var opcode_byte = 0; opcode_byte < 256; opcode_byte++) {
                for (var addressing_byte = 0; addressing_byte < 256; addressing_byte++) {
                    var opcode = cpu8086._decode(opcode_byte, addressing_byte);
                    var inc = cpu8086._getRMIncIP(opcode);

                    if ((0 === opcode.mod) && (6 === opcode.rm) && (0 === opcode.w)) {
                        inc.should.equal(1);
                    } else if ((0 === opcode.mod) && (6 === opcode.rm) && (1 === opcode.w)) {
                        inc.should.equal(2);
                    } else if ((1 === opcode.mod || 2 == opcode.mod)) {
                        inc.should.equal(2);
                    } else {
                        inc.should.equal(0);
                    }
                }
            }
        });

        it('should execute push', function () {
            var starting_SP;

            // Push a byte
            cpu8086.clearMemory();
            starting_SP = cpu8086._regSP;
            cpu8086._push(0xFF);
            m8(cpu8086.segment2absolute(cpu8086._regSS, cpu8086._regSP)).should.equal(0xFF);
            cpu8086._regSP.should.equal(starting_SP - 2);

            // Push a word
            cpu8086.clearMemory();
            starting_SP = cpu8086._regSP;
            cpu8086._push(0xFFFF);
            m16(cpu8086.segment2absolute(cpu8086._regSS, cpu8086._regSP)).should.equal(0xFFFF);
            cpu8086._regSP.should.equal(starting_SP - 2);

            // On the 8086, a PUSH instruction or implicit stack push will
            // decrement the SP register by two and store the appropriate
            // quantity at SS:SP (i.e. 16*SS+SP). If the SP register was $0000,
            // the data will go to SS:$FFFE. If the SP register was $0001, the
            // MSB of the data will go to SS:$0000 and the LSB will go to
            // SS:$FFFF. The processor will not take any special notice of the
            // stack wraparound. While stack wraparound would typically be a
            // bad thing, there are some situations on the 8086 where it could
            // be ignored at wouldn't affect anything. For example, if SS
            // pointed to 64K of RAM that wasn't needed for anything else, and
            // a program which was never going to exit sometimes restarted
            // itself by simply calling "main()" without resetting the stack,
            // the stack could wrap around without affecting program operation,
            // since all effective-address calculations would wrap around the
            // same way.
            //
            // Note that on the 80386 and later processors, the stack-underflow
            // behavior is changed. PUSH, POP, CALL, RET, etc. use ESP rather
            // than SP, and ESP wraps to $FFFFFFFF rather than $FFFF.
            //
            // http://stackoverflow.com/a/4830642/1436323
        });

        it('should execute pop', function () {
            cpu8086.clearMemory();

            // Cram some values onto the stack
            for (var i = 0; i < 16; i++) {
                cpu8086._memoryV[cpu8086.segment2absolute(cpu8086._regSS, cpu8086._regSP + i)] = i;
            }

            cpu8086._pop().should.equal((0x01 << 8) | 0x00);
            cpu8086._pop().should.equal((0x03 << 8) | 0x02);
            cpu8086._pop().should.equal((0x05 << 8) | 0x04);

            // TODO: Stack underflow (see above)
        });

        it('should execute short jump', function () {
            // Jump 3 bytes forward
            cpu8086._memoryV[cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regIP + 1)] = u.Bin2Hex("00000011");
            var offset = cpu8086._memoryV[cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regIP + 1)];
            cpu8086._shortJump();
            cpu8086._regIP.should.equal(0x12);

            u.setRegisterIdent(cpu8086);

            // Jump 3 bytes backward
            cpu8086._memoryV[cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regIP + 1)] = u.Bin2Hex("11111101");
            var offset = cpu8086._memoryV[cpu8086.segment2absolute(cpu8086._regCS, cpu8086._regIP + 1)];
            cpu8086._shortJump();
            cpu8086._regIP.should.equal(0x0C);
        });

        it.skip('should set flag register', function () {
            // TODO: Write test
            false.should.be.true;
            // cpu8086._setFlags()
        });

        it('should bundle register values', function () {
            cpu8086._bundleRegisters().should.eql({
                AX: (0x01 << 8) | 0x02,
                  AH: 0x01,
                  AL: 0x02,
                  BX: (0x03 << 8) | 0x04,
                  BH: 0x03,
                  BL: 0x04,
                  CX: (0x05 << 8) | 0x06,
                  CH: 0x05,
                  CL: 0x06,
                  DX: (0x07 << 8) | 0x08,
                  DH: 0x07,
                  DL: 0x08,
                  SI: 0x09,
                  DI: 0x0A,
                  BP: 0x0B,
                  SP: 0x0C,
                  CS: 0x0E,
                  DS: 0x0F,
                  ES: 0x10,
                  SS: 0x11,
                  IP: 0x0D,
                  FLAGS: 0x12
            });
        });

        afterEach(function(){
            cpu8086.clearRegisters()
        })
    });


    describe('Cpu Instructions', function(){

        beforeEach("State Setup", function(){
            cpu8086.configure(u.buildCPUMock(), u.buildSettingsMock(), u.buildGUIMock());
            cpu8086.initializeMemory();
            cpu8086.initializePorts();
            cpu8086.clearRegisters();
            cpu8086.initIP();
            cpu8086.clearMemory();
        });

        // https://defuse.ca/online-x86-assembler.htm

        //it.skip('Instruction ADD Eb Gb [0x00] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADD Ev Gv [0x01] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADD Gb Eb [0x02] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADD Gv Ev [0x03] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADD AL Ib [0x04] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADD eAX Iv [0x05] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH ES [0x06] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP ES [0x07] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OR Eb Gb [0x08] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OR Ev Gv [0x09] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OR Gb Eb [0x0A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OR Gv Ev [0x0B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OR AL Ib [0x0C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OR eAX Iv [0x0D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH CS [0x0E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADC Eb Gb [0x10] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADC Ev Gv [0x11] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADC Gb Eb [0x12] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADC Gv Ev [0x13] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADC AL Ib [0x14] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ADC eAX Iv [0x15] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH SS [0x16] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP SS [0x17] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SBB Eb Gb [0x18] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SBB Ev Gv [0x19] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SBB Gb Eb [0x1A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SBB Gv Ev [0x1B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SBB AL Ib [0x1C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SBB eAX Iv [0x1D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH DS [0x1E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP DS [0x1F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AND Eb Gb [0x20] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AND Ev Gv [0x21] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AND Gb Eb [0x22] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AND Gv Ev [0x23] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AND AL Ib [0x24] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AND eAX Iv [0x25] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction ES [0x26] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DAA [0x27] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SUB Eb Gb [0x28] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SUB Ev Gv [0x29] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SUB Gb Eb [0x2A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SUB Gv Ev [0x2B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SUB AL Ib [0x2C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SUB eAX Iv [0x2D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CS [0x2E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DAS [0x2F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XOR Eb Gb [0x30] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XOR Ev Gv [0x31] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XOR Gb Eb [0x32] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XOR Gv Ev [0x33] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XOR AL Ib [0x34] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XOR eAX Iv [0x35] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SS [0x36] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AAA [0x37] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMP Eb Gb [0x38] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMP Ev Gv [0x39] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMP Gb Eb [0x3A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMP Gv Ev [0x3B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMP AL Ib [0x3C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMP eAX Iv [0x3D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DS [0x3E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AAS [0x3F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eAX [0x40] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eCX [0x41] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eDX [0x42] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eBX [0x43] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eSP [0x44] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eBP [0x45] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eSI [0x46] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INC eDI [0x47] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eAX [0x48] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eCX [0x49] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eDX [0x4A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eBX [0x4B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eSP [0x4C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eBP [0x4D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eSI [0x4E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction DEC eDI [0x4F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eAX [0x50] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eCX [0x51] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eDX [0x52] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eBX [0x53] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eSP [0x54] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eBP [0x55] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eSI [0x56] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSH eDI [0x57] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eAX [0x58] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eCX [0x59] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eDX [0x5A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eBX [0x5B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eSP [0x5C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eBP [0x5D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eSI [0x5E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP eDI [0x5F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JO Jb [0x70] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JNO Jb [0x71] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JB Jb [0x72] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JNB Jb [0x73] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JZ Jb [0x74] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JNZ Jb [0x75] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JBE Jb [0x76] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JA Jb [0x77] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JS Jb [0x78] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JNS Jb [0x79] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JPE Jb [0x7A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JPO Jb [0x7B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JL Jb [0x7C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JGE Jb [0x7D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JLE Jb [0x7E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JG Jb [0x7F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP1 Eb Ib [0x80] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP1 Ev Iv [0x81] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP1 Eb Ib [0x82] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP1 Ev Ib [0x83] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction TEST Gb Eb [0x84] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction TEST Gv Ev [0x85] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG Gb Eb [0x86] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG Gv Ev [0x87] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Eb Gb [0x88] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Ev Gv [0x89] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Gb Eb [0x8A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Gv Ev [0x8B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Ew Sw [0x8C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LEA Gv M [0x8D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Sw Ew [0x8E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POP Ev [0x8F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction NOP [0x90] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eCX eAX [0x91] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eDX eAX [0x92] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eBX eAX [0x93] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eSP eAX [0x94] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eBP eAX [0x95] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eSI eAX [0x96] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XCHG eDI eAX [0x97] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CBW [0x98] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CWD [0x99] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CALL Ap [0x9A] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction WAIT [0x9B] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction PUSHF [0x9C] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction POPF [0x9D] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SAHF [0x9E] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LAHF [0x9F] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV AL Ob [0xA0] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eAX Ov [0xA1] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Ob AL [0xA2] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Ov eAX [0xA3] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOVSB [0xA4] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOVSW [0xA5] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMPSB [0xA6] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMPSW [0xA7] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction TEST AL Ib [0xA8] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction TEST eAX Iv [0xA9] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction STOSB [0xAA] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction STOSW [0xAB] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LODSB [0xAC] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LODSW [0xAD] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SCASB [0xAE] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction SCASW [0xAF] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV AL Ib [0xB0] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV CL Ib [0xB1] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV DL Ib [0xB2] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV BL Ib [0xB3] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV AH Ib [0xB4] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV CH Ib [0xB5] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV DH Ib [0xB6] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV BH Ib [0xB7] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eAX Iv [0xB8] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eCX Iv [0xB9] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eDX Iv [0xBA] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eBX Iv [0xBB] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eSP Iv [0xBC] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eBP Iv [0xBD] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eSI Iv [0xBE] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV eDI Iv [0xBF] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction RET Iw [0xC2] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction RET [0xC3] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LES Gv Mp [0xC4] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LDS Gv Mp [0xC5] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Eb Ib [0xC6] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction MOV Ev Iv [0xC7] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction RETF Iw [0xCA] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction RETF [0xCB] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INT 3 [0xCC] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INT Ib [0xCD] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction INTO [0xCE] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction IRET [0xCF] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP2 Eb 1 [0xD0] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP2 Ev 1 [0xD1] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP2 Eb CL [0xD2] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP2 Ev CL [0xD3] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AAM I0 [0xD4] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction AAD I0 [0xD5] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction XLAT [0xD7] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LOOPNZ Jb [0xE0] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LOOPZ Jb [0xE1] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LOOP Jb [0xE2] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JCXZ Jb [0xE3] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction IN AL Ib [0xE4] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction IN eAX Ib [0xE5] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OUT Ib AL [0xE6] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OUT Ib eAX [0xE7] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CALL Jv [0xE8] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JMP Jv [0xE9] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JMP Ap [0xEA] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction JMP Jb [0xEB] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction IN AL DX [0xEC] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction IN eAX DX [0xED] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OUT DX AL [0xEE] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction OUT DX eAX [0xEF] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction LOCK [0xF0] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction REPNZ [0xF2] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction REPZ [0xF3] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction HLT [0xF4] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CMC [0xF5] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP3a Eb [0xF6] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP3b Ev [0xF7] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CLC [0xF8] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction STC [0xF9] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CLI [0xFA] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction STI [0xFB] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction CLD [0xFC] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction STD [0xFD] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP4 Eb [0xFE] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
        //
        //it.skip('Instruction GRP5 Ev [0xFF] should execute', function() {
        //    // TODO: Write test
        //    false.should.be.true;
        //});
    });

});
