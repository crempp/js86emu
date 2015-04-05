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
 * Load the CPU Module using Require.js
 *
 * @param done
 */
function loadCpuModule(done) {
    // Load the CPU module using require.js
    requirejs(['emu/cpus/8086'], function (_File) {
        Cpu = _File;
        done();
    });
}

/**
 * Emulator tests
 */
describe('Emu', function () {


    /**
     * CPU Tests
     */
    describe('Cpu', function () {


        /**
         * 8086 Tests
         */
        describe('8086', function () {

            // Setup the CPU
            var cpu8086,
                cpuClean; // a fresh CPU for resetting the cpu8086
            before("CPU Setup", function (done) {
                // Load the CPU module using require.js
                requirejs(['emu/cpus/8086'], function (_File) {
                    cpu8086 = _File;

                    // Configure
                    cpu8086.configure(u.buildCPUMock(), u.buildSettingsMock());

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

                    tmp_cpu.configure(u.buildCPUMock(), tmp_settings);
                    tmp_cpu.initializeMemory();
                    tmp_cpu.clearMemory();
                    tmp_cpu.clearRegisters();

                });

                it('should configure', function() {
                    // The CPU was configured in the beforeEach()
                    tmp_cpu.getSetting("address").should.be.equal(tmp_settings["address"]);
                    tmp_cpu.getSetting("use-bios").should.be.equal(tmp_settings["use-bios"]);
                    tmp_cpu.getSetting("file").should.be.equal(tmp_settings["file"]);
                    tmp_cpu.getSetting("id").should.be.equal(tmp_settings["id"]);
                    tmp_cpu.getSetting("name").should.be.equal(tmp_settings["name"]);
                    tmp_cpu.getSetting("selected").should.be.equal(tmp_settings["selected"]);
                    // Use .eql for an object, how deep does this go?
                    tmp_cpu.getSetting("cpu-init").should.be.eql(tmp_settings["cpu-init"]);
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

                    // Verifify
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
                    var tem_tmp_settings = u.buildSettingsMock();
                    tem_tmp_settings['use-bios'] = true;
                    tmp_tmp_cpu.configure(u.buildCPUMock(), tem_tmp_settings);
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
                    // Should be able to load a blob the size of ram
                    tmp_cpu.clearMemory();
                    var blob = new Uint8Array(tmp_cpu._memoryV.length);
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

                    // Oversized blobs should throw exceptions
                    tmp_cpu.clearMemory();
                    var blob = new Uint8Array(tmp_cpu._memoryV.length + 1);
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
                before(function(){
                    cpu8086.initializeMemory();
                });

                beforeEach(function(){
                    // Assign identifying values to registers
                    cpu8086.clearRegisters();
                    u.setRegisterIdent(cpu8086);

                    // Assign identifying values to memory
                    cpu8086.clearMemory();
                    u.setMemoryIdent(cpu8086);
                })

                it('should return register value based on opcode <_getRegValueForOp>', function () {
                    /**
                     *   REG w=0 w=1  REG w=0 w=1
                     *   000 AL  AX   100 AH  SP
                     *   001 CL  CX   101 CH  BP
                     *   010 DL  DX   110 DH  SI
                     *   011 BL  BX   111 BH  DI
                     */
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00000000")))
                        .should.equal(cpu8086._regAL);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00001000")))
                        .should.equal(cpu8086._regCL);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00010000")))
                        .should.equal(cpu8086._regDL);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00011000")))
                        .should.equal(cpu8086._regBL);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00100000")))
                        .should.equal(cpu8086._regAH);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00101000")))
                        .should.equal(cpu8086._regCH);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00110000")))
                        .should.equal(cpu8086._regDH);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000000"), u.Bin2Hex("00111000")))
                        .should.equal(cpu8086._regBH);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00000000")))
                        .should.equal(((cpu8086._regAH<<8)|cpu8086._regAL));
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00001000")))
                        .should.equal(((cpu8086._regCH<<8)|cpu8086._regCL));
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00010000")))
                        .should.equal(((cpu8086._regDH<<8)|cpu8086._regDL));
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00011000")))
                        .should.equal(((cpu8086._regBH<<8)|cpu8086._regBL));
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00100000")))
                        .should.equal(cpu8086._regSP);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00101000")))
                        .should.equal(cpu8086._regBP);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00110000")))
                        .should.equal(cpu8086._regSI);
                    cpu8086._getRegValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00111000")))
                        .should.equal(cpu8086._regDI);
                });

                it('should return register/memory based on opcode <_getRMValueForOp>', function () {
                    // TODO: Write test
                    //cpu8086._getRMValueForOp(cpu8086._decode(u.Bin2Hex("00000001"), u.Bin2Hex("00111000")))
                });

                it('should set register value based on opcode <_setRegValueForOp>', function () {
                    // TODO: Write test
                    // cpu8086._setRegValueForOp()
                });

                it('should set register/memory based on opcode <_setRMValueForOp>', function () {
                    // TODO: Write test
                    // cpu8086._setRMValueForOp()
                });

                it('should ??? <_getRMIncIP>', function () {
                    // TODO: Write test
                    // cpu8086._getRMIncIP()
                });

                it('should execute push', function () {
                    // TODO: Write test
                   // cpu8086. _push()
                });

                it('should execute pop', function () {
                    // TODO: Write test
                    // cpu8086._pop()
                });

                it('should execute short jump', function () {
                    // TODO: Write test
                    // cpu8086._shortJump()
                });

                it('should set flag register', function () {
                    // TODO: Write test
                    // cpu8086._setFlags()
                });

                it('should bundle register values', function () {
                    // TODO: Write test
                    // cpu8086._bundleRegisters()
                });

                afterEach(function(){
                    cpu8086.clearRegisters()
                })
            });


            describe('Cpu Instructions', function(){

                beforeEach("State Setup", function(){
                    cpu8086.configure(u.buildCPUMock(), u.buildSettingsMock());
                    cpu8086.initializeMemory();
                    cpu8086.clearRegisters();
                    cpu8086.initIP();
                    cpu8086.clearMemory();
                });

                // https://defuse.ca/online-x86-assembler.htm
                it('should ADD', function() {
                    // var settings = SettingsModel.get('emuSettings')["blobSettings"]
                    //var opcode = buildOpcode(0x10, 0xD8);
                    //cpu8086.run

                });

            });

        });

    });

});
